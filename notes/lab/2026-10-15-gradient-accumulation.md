---
title: Gradient accumulation: bigger batches, same memory
date: 2026-10-15
topic: training
signal: lab
author: Gaurav K
source: Implementation note
url: https://github.com/gaurav98095/gradient-a-day
summary: Gradient accumulation lets a small GPU train with a larger effective batch. Run several small batches, keep their gradients, and update the model only once. This is useful for long sequences, large images, and transformer models. The trade-off is fewer optimizer updates and a slightly longer training loop.
---

# The idea

A GPU may not fit a batch of 64, but it may fit batches of 8. Gradient accumulation runs several small batches, keeps their gradients, and updates the model once. The model sees the same total number of examples as a larger batch, while each forward pass stays small.

![Several micro-batches contribute to one optimizer step](assets/gradient-accumulation/gradient-accumulation-loop.png)

## The math

The effective batch size is:

```text
effective batch = micro-batch × accumulation steps × number of devices
```

For example, a micro-batch of 8, accumulated for 8 steps, gives an effective batch of 64 on one GPU. With four GPUs, the effective batch becomes 256.

The important detail is to divide the loss by `accumulation_steps`. This makes the accumulated gradient an average, so changing the number of accumulation steps does not silently multiply the learning rate.

## A small PyTorch example

```python
accumulation_steps = 4
optimizer.zero_grad(set_to_none=True)

for step, (inputs, targets) in enumerate(loader):
    logits = model(inputs)
    loss = criterion(logits, targets)

    # Average the gradients across the micro-batches.
    (loss / accumulation_steps).backward()

    if (step + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad(set_to_none=True)
```

There are four backward passes for every optimizer update. The gradients add up in the model parameters until `optimizer.step()` is called. `zero_grad()` then starts the next effective batch.

![A small batch fits in memory while the effective batch grows](assets/gradient-accumulation/gradient-accumulation-memory.png)

## A fuller training loop

Mixed precision is common when the GPU is tight on memory. The scaler protects small float16 gradients from underflow while accumulation still controls when weights change.

```python
accumulation_steps = 8
scaler = torch.amp.GradScaler("cuda")
optimizer.zero_grad(set_to_none=True)

for step, (inputs, targets) in enumerate(loader):
    inputs = inputs.to(device, non_blocking=True)
    targets = targets.to(device, non_blocking=True)

    with torch.autocast(device_type="cuda", dtype=torch.float16):
        predictions = model(inputs)
        loss = criterion(predictions, targets)
        loss = loss / accumulation_steps

    scaler.scale(loss).backward()

    is_accumulation_end = (step + 1) % accumulation_steps == 0
    is_last_batch = (step + 1) == len(loader)

    if is_accumulation_end or is_last_batch:
        scaler.step(optimizer)
        scaler.update()
        optimizer.zero_grad(set_to_none=True)
```

The `is_last_batch` check matters when the number of batches is not divisible by 8. Without it, the final partial group would leave gradients unused and the last examples would not update the model.

![Standard updates compared with one update after several micro-batches](assets/gradient-accumulation/gradient-accumulation-training.png)

## What changes

- Memory per forward pass stays close to the micro-batch size.
- The effective batch becomes larger.
- The optimizer updates less often.
- An epoch can take a little longer because there are more optimizer-free backward passes.
- The learning-rate schedule should usually advance per optimizer update, not per micro-batch.

## Common mistakes

1. **Do not divide the loss.** Gradients become too large as accumulation grows.
2. **Do not clear gradients every micro-batch.** That removes the accumulation.
3. **Do not forget the final partial group.** Step when the loader ends.
4. **Count optimizer updates carefully.** Warmup, cosine decay, and logging may need update-level steps.
5. **Remember BatchNorm.** Its running statistics still see the small micro-batch, so accumulation is not always identical to a physically large batch.
6. **Clip after accumulation.** Unscale first when using mixed precision, then clip the combined gradient before the optimizer step.

## When to use it

Gradient accumulation is useful when a larger batch would help optimization but GPU memory is the bottleneck. It is especially practical for long sequences, large images, and transformer models. It does not reduce the memory needed for a single example, and it does not make each forward pass faster; it trades update frequency for a larger training signal.

## Short takeaway

Gradient accumulation is the simplest way to simulate a larger batch on a smaller GPU: run several small batches, average their gradients, then update the weights once.
