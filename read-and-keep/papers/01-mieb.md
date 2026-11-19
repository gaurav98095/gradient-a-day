---
index: 01
date: 2026-11-14
category: Dataset
title: MIEB: Massive Image Embedding Benchmark
authors: Xiao et al.
year: 2025
url: https://arxiv.org/abs/2504.10471
ideas:
- MIEB evaluates image and image-text embeddings across 130 tasks; MIEB-lite keeps a representative 51-task version.
- The benchmark is embedding-first rather than generation-first, covering image-only, text-image, and interleaved inputs.
- MIEB-lite removes redundant tasks using model-performance correlations while preserving category coverage.
takeaways:
- Benchmarks are more reusable when their dataset interface is extensible.
- MLLMs win overall; CLIP models lead on probing and classification.
notes:
- MIEB evaluates image and image-text embeddings across 130 tasks; MIEB-lite provides a representative 51-task version.
- It covers multi-directional retrieval, probing, clustering, compositionality, visual question answering, and semantic similarity.
- Finding: MLLMs perform best overall, while CLIP-style models remain stronger on linear probing and zero-shot classification.
- Its dataset interface makes the benchmark easy to extend with new evaluation sets.
---
