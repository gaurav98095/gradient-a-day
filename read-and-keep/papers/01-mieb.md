---
index: 01
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
- Extendability: you can add a new dataset of your choice through the benchmark’s dataset interface.
- MLLM-based models win overall, but CLIP-style models outperform them on linear probing and zero-shot classification.
notes:
- The eight groups are Retrieval, Document Understanding, Linear Probing, Clustering, Zero-shot Classification, Compositionality Evaluation, Vision-centric QA, and Visual STS.
- Retrieval spans cross-modal directions such as image→image, image→text, text→image, and interleaved image-text variants.
- The extensibility story is strong: a new dataset can be added with a small metadata file in the benchmark framework.
- MLLM-based models lead overall, while CLIP-style models remain especially strong on linear probing and zero-shot classification.
- MIEB-lite is built by iteratively removing tasks with high average pairwise performance correlation: above 0.5, then above 0.45.
---
