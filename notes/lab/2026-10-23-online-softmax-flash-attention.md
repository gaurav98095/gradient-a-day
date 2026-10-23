---
title: Online softmax: the trick behind tiled FlashAttention
date: 2026-10-23
topic: attention
mode: lab
author: Gaurav K
source: Implementation note
summary: Online softmax processes attention scores in small chunks while preserving one exact, stable softmax. This lab derives every update numerically and implements it from scratch.
---

# The question

Suppose one attention row contains six scores:

```text
[1, 2, 3, 4, 5, 6]
```

We want to process only three scores at a time:

```text
chunk 1: [1, 2, 3]       chunk 2: [4, 5, 6]
```

The ordinary softmax is:

$$
p_i = \frac{e^{s_i}}{\sum_j e^{s_j}}.
$$

Directly computing $e^6$, $e^5$, and so on is not ideal. The stable form subtracts the largest score $m$:

$$
p_i = \frac{e^{s_i-m}}{\ell}, \qquad
\ell = \sum_j e^{s_j-m}.
$$

The challenge is that we do not know the final $m$ after seeing only the first chunk.

# Step 1: process the first chunk

For the first chunk $[1,2,3]$, its local maximum is:

$$
m_1 = \max(1,2,3) = 3.
$$

Subtract $m_1$ from every score. These are the exponentials we actually keep:

$$
[e^{1-3}, e^{2-3}, e^{3-3}]
= [e^{-2}, e^{-1}, e^0]
\approx [0.135335, 0.367879, 1].
$$

Add them to get the local normalizer:

$$
\ell_1 = 0.135335 + 0.367879 + 1
\approx 1.503214.
$$

At this point our running state is:

```text
running max m = 3
running sum l = 1.503214
```

This is not yet the final softmax. We have not seen the scores 4, 5, and 6.

# Step 2: process the second chunk

For $[4,5,6]$, the local maximum is:

$$
m_2 = \max(4,5,6) = 6.
$$

Its local exponentials are:

$$
[e^{4-6}, e^{5-6}, e^{6-6}]
= [e^{-2}, e^{-1}, e^0]
\approx [0.135335, 0.367879, 1].
$$

So its local normalizer is also:

$$
\ell_2 = 0.135335 + 0.367879 + 1
\approx 1.503214.
$$

The new global maximum is:

$$
m' = \max(m, m_2) = \max(3,6) = 6.
$$

The old chunk was measured relative to 3, but the new global state is measured relative to 6. Therefore multiply the old sum by the correction factor:

$$
\text{old correction} = e^{m-m'} = e^{3-6} = e^{-3}
\approx 0.049787.
$$

The old chunk contributes:

$$
e^{-3}\ell_1
= 0.049787 \times 1.503214
\approx 0.074841.
$$

The new chunk is already measured relative to 6, so its correction factor is $e^{6-6}=1$:

$$
e^{m_2-m'}\ell_2
= 1 \times 1.503214
= 1.503214.
$$

Now add both contributions:

$$
\ell'
= 0.049787 \times 1.503214 + 1 \times 1.503214
\approx 1.578055.
$$

That is exactly the stable denominator for all six scores relative to the final maximum 6:

$$
\ell' = e^{-5}+e^{-4}+e^{-3}+e^{-2}+e^{-1}+e^0.
$$

# Step 3: produce the final probabilities

Now every score uses the same final maximum (m'=6) and the same final denominator (ell'=1.578055):

$$
p_i = \frac{e^{s_i-6}}{1.578055}.
$$

For example, the probability of score 2 is:

$$
p_2 = \frac{e^{2-6}}{1.578055}
= \frac{0.018316}{1.578055}
\approx 0.011606.
$$

The six probabilities are approximately:

```text
[0.004270, 0.011606, 0.031550, 0.085761, 0.233122, 0.633692]
```

Their sum is 1 up to floating-point rounding. The important point is that the first chunk was not thrown away: its contributions were multiplied by $e^{3-6}$ when the larger global maximum appeared.

# Step 4: the value accumulator used by attention

Attention needs more than probabilities. Given values $v_i$, it needs:

$$
o = \sum_i p_i v_i.
$$

Use example values:

```text
scores: [1, 2, 3] [4, 5, 6]
values: [10, 20, 30] [40, 50, 60]
```

For the first chunk, calculate the unnormalized weighted value using its local maximum $m_1=3$:

$$
u_1 = 0.135335\times10 + 0.367879\times20 + 1\times30
\approx 38.711.
$$

For the second chunk, using $m_2=6$:

$$
u_2 = 0.135335\times40 + 0.367879\times50 + 1\times60
\approx 83.807.
$$

When the global maximum becomes 6, rescale the old value accumulator in exactly the same way as the old normalizer:

$$
u'
= e^{3-6}u_1 + e^{6-6}u_2
= 0.049787\times38.711 + 1\times83.807
\approx 85.735.
$$

Finally divide the accumulated weighted value by the accumulated normalizer:

$$
o = \frac{u'}{\ell'}
= \frac{85.735}{1.578055}
\approx 54.32.
$$

This is the same result as computing all six softmax probabilities first and then multiplying them by the six values. FlashAttention keeps this accumulator as a vector when each $v_i$ is a vector.

# The recurrence

For every new chunk (k), compute its local maximum and local statistics:

$$
m_k = \max_{i \in k} s_i, \qquad
\ell_k = \sum_{i \in k} e^{s_i-m_k}, \qquad
u_k = \sum_{i \in k} e^{s_i-m_k}v_i.
$$

Merge them into the running state:

$$
m' = \max(m,m_k),
$$

$$
\ell' = e^{m-m'}\ell + e^{m_k-m'}\ell_k,
$$

$$
u' = e^{m-m'}u + e^{m_k-m'}u_k.
$$

Then replace ((m,\ell,u)) with ((m',\ell',u')). At the end, return (u/\ell), or use the final (m) and (ell) to normalize ordinary softmax probabilities.

# Complete Python implementation

This is written from scratch on the page. It does not import the implementation from `labs/`; the separate file is only there so the same experiment can also be run directly.

```python
import math


def online_softmax(scores, chunk_size=3):
    """Compute softmax while visiting only one score chunk at a time."""
    if chunk_size < 1:
        raise ValueError("chunk_size must be positive")
    if not scores:
        return []

    running_max = -math.inf
    running_sum = 0.0

    for start in range(0, len(scores), chunk_size):
        chunk = scores[start:start + chunk_size]
        chunk_max = max(chunk)
        chunk_sum = sum(math.exp(score - chunk_max) for score in chunk)

        new_max = max(running_max, chunk_max)
        old_scale = math.exp(running_max - new_max)
        chunk_scale = math.exp(chunk_max - new_max)

        running_sum = old_scale * running_sum + chunk_scale * chunk_sum
        running_max = new_max

    return [
        math.exp(score - running_max) / running_sum
        for score in scores
    ]


def online_attention(scores, values, chunk_size=3):
    """Compute a scalar attention output with the same online recurrence."""
    if len(scores) != len(values):
        raise ValueError("scores and values must have the same length")
    if chunk_size < 1:
        raise ValueError("chunk_size must be positive")
    if not scores:
        raise ValueError("scores and values cannot be empty")

    running_max = -math.inf
    running_sum = 0.0
    running_value = 0.0

    for start in range(0, len(scores), chunk_size):
        score_chunk = scores[start:start + chunk_size]
        value_chunk = values[start:start + chunk_size]
        chunk_max = max(score_chunk)

        weights = [
            math.exp(score - chunk_max)
            for score in score_chunk
        ]
        chunk_sum = sum(weights)
        chunk_value = sum(
            weight * value
            for weight, value in zip(weights, value_chunk)
        )

        new_max = max(running_max, chunk_max)
        old_scale = math.exp(running_max - new_max)
        chunk_scale = math.exp(chunk_max - new_max)

        running_sum = old_scale * running_sum + chunk_scale * chunk_sum
        running_value = old_scale * running_value + chunk_scale * chunk_value
        running_max = new_max

    return running_value / running_sum


scores = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0]
values = [10.0, 20.0, 30.0, 40.0, 50.0, 60.0]

print(online_softmax(scores, chunk_size=3))
print(online_attention(scores, values, chunk_size=3))
```

The first function returns the six probabilities. The second function shows the FlashAttention-shaped computation: each chunk produces weights, those weights multiply the values, and both the normalizer and value accumulator are rescaled when a new maximum appears.

# Takeaway

Online softmax does not approximate a full softmax. It keeps a compact running state—maximum, normalizer, and optionally a value accumulator—and rescales the old state whenever a later chunk changes the maximum.
