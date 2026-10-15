---
title: CLIP by OpenAI
date: 2026-10-15
topic: AI & ML
author: OpenAI
source: Paper · 2021
url: https://arxiv.org/abs/2103.00020
image: assets/clip-banner.png
---

CLIP uses contrastive pre-training to bring images and their natural-language descriptions into the same shared embedding space. During training, the model learns which image-text pairs belong together and which do not, so an image can later be matched against a set of text labels without task-specific training.

The paper trains large-scale image-text models with Transformer-based text encoders and image encoders including Vision Transformers. The central result is strong zero-shot transfer: CLIP reaches 76.2% top-1 accuracy on ImageNet without using ImageNet labels, matching the accuracy of a supervised ResNet-50 baseline while generalizing across many other datasets.
