---
title: Jina Embeddings v3: one model, many embedding behaviors
date: 2026-10-15
topic: embeddings
mode: brief
author: Jina AI · Sturua et al.
source: Paper · 2024
url: https://arxiv.org/abs/2409.10173
---

Most embedding models try to use one set of weights for every task. Jina Embeddings v3 takes a more useful approach: keep one shared multilingual model, then add small task adapters. A search query and a document passage have different roles, so they should not be embedded in exactly the same way.

The model has five LoRA adapters: `retrieval.query`, `retrieval.passage`, `separation`, `classification`, and `text-matching`. The first two handle asymmetric search. The others support clustering, labels, and matching similar text. Each adapter uses its own training loss, while the main model stays fixed.

Jina v3 has 570M parameters, supports 8,192 tokens and 89 languages, and returns 1,024-dim vectors. MRL lets you shrink the vectors to as few as 32 dims. The authors also test hard cases such as word overlap, name mix-ups, yes/no questions, and low-quality documents.
