---
index: 04
date: 2026-11-19
category: Multimodal representation
title: MOON: Generative MLLM-based Multimodal Representation Learning for E-commerce Product Understanding
authors: Daoze Zhang et al.
year: 2025
url: https://arxiv.org/abs/2508.11999
ideas:
- MOON uses a generative multimodal LLM to produce unified product embeddings from text, images, and image-text queries.
- Qwen2.5-VL detects the core product region; the model then feeds both the original image and cropped image through the vision encoder and projector, while product text is tokenized for joint processing in the LLM.
- A guided Mixture-of-Experts module routes category- and attribute-related information to specialized experts inside the LLM's feed-forward layers.
- The final representation is the mean-pooled hidden state from the LLM, supporting retrieval, classification, and attribute prediction.
takeaways:
- Purchase history is a useful contrastive signal.
- Guided MoE improves category and attribute encoding.
notes:
- MOON uses a generative MLLM to jointly represent product text, the original image, and a cropped core-product image.
- Qwen2.5-VL removes background distraction; a guided MoE specializes in category- and attribute-related information before mean pooling produces the embedding.
- Training uses purchase behavior: a query is pulled toward the purchased item and pushed away from a same-category, different-product hard negative.
- Finding: core cropping, guided MoE, and expanded hard negatives each improve zero-shot retrieval, classification, and attribute prediction on the MBE benchmark.
---
