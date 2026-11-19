---
index: 05
date: 2026-11-19
category: Composed retrieval
title: Zero-Shot Composed Image Retrieval with Textual Inversion
authors: Alberto Baldrati et al.
year: 2023
url: https://arxiv.org/abs/2303.15247
keywords:
- SEARLE
- zero-shot CIR
- composed image retrieval
- textual inversion
- pseudo-word token
- CLIP
- CIRCO
- cross-modal mapping
- FashionIQ
- CIRR
- textual inversion network
ideas:
- The paper introduces zero-shot composed image retrieval (ZS-CIR): retrieve a target image from a reference image and a relative caption without labeled CIR training data.
- SEARLE maps the reference image's visual features to a pseudo-word token in CLIP's text-token embedding space, then combines that token with the relative caption.
- Training has two stages: optimization-based textual inversion creates expressive pseudo-word tokens on unlabeled images, then a textual inversion network learns to reproduce them efficiently.
- CIRCO is an open-domain benchmark with multiple ground-truth target images for each query, addressing the limits of earlier CIR datasets.
takeaways:
- A small MLP can map image embeddings into text-embedding space, creating a practical bridge between modalities.
notes:
- At inference, the reference image becomes a pseudo-token such as S*, which is inserted into a text prompt with the relative caption; the resulting CLIP text embedding retrieves target images from a vector index.
- Optimization-based textual inversion is expressive but slow, so the learned textual inversion network distills that mapping for fast zero-shot use.
- The method avoids task-specific CIR supervision and works with a frozen CLIP-style image/text space.
- Finding: SEARLE outperforms earlier baselines on FashionIQ, CIRR, and the proposed CIRCO benchmark.
---
