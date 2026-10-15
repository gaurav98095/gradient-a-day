---
title: CLIP by OpenAI
date: 2026-10-15
topic: embeddings
signal: brief
author: OpenAI
source: Paper · 2021
url: https://arxiv.org/abs/2103.00020
image: assets/brief/clip-banner.png
---

CLIP uses contrastive training to place images and text in one shared embedding space. An image can then be matched with text labels without task-specific training.

The model uses a Transformer text encoder and image encoders such as Vision Transformers. It shows strong zero-shot transfer: 76.2% top-1 accuracy on ImageNet without ImageNet labels, matching a supervised ResNet-50 baseline.
