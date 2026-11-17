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
- The benchmark is organized around eight evaluation groups, moving from retrieval and document understanding to probing, clustering, compositionality, visual question answering, and visual semantic similarity.
- Retrieval is deliberately multi-directional: it tests image→image, image→text, text→image, and interleaved image-text search rather than a single matching direction.
---
