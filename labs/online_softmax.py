"""Reference implementation of online softmax over chunks."""

from __future__ import annotations

import math
from collections.abc import Iterable, Sequence


def online_softmax(values: Sequence[float], chunk_size: int = 3) -> list[float]:
    """Return softmax(values), processing at most chunk_size values at once."""
    if chunk_size < 1:
        raise ValueError("chunk_size must be positive")
    if not values:
        return []

    running_max = -math.inf
    running_sum = 0.0

    for chunk in chunks(values, chunk_size):
        chunk_max = max(chunk)
        chunk_sum = sum(math.exp(value - chunk_max) for value in chunk)
        new_max = max(running_max, chunk_max)
        running_sum = (
            math.exp(running_max - new_max) * running_sum
            + math.exp(chunk_max - new_max) * chunk_sum
        )
        running_max = new_max

    return [math.exp(value - running_max) / running_sum for value in values]


def chunks(values: Sequence[float], size: int) -> Iterable[Sequence[float]]:
    """Yield consecutive chunks without copying more than one chunk."""
    for start in range(0, len(values), size):
        yield values[start : start + size]


def reference_softmax(values: Sequence[float]) -> list[float]:
    """Numerically stable ordinary softmax, used only for comparison."""
    maximum = max(values)
    exponentials = [math.exp(value - maximum) for value in values]
    total = sum(exponentials)
    return [value / total for value in exponentials]


if __name__ == "__main__":
    scores = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0]
    actual = online_softmax(scores, chunk_size=3)
    expected = reference_softmax(scores)
    print("online:", [round(value, 6) for value in actual])
    print("max error:", max(abs(a - b) for a, b in zip(actual, expected)))
    assert all(abs(a - b) < 1e-12 for a, b in zip(actual, expected))
