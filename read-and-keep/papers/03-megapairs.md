---
index: 03
date: 2026-11-15
category: Data synthesis
title: MegaPairs: Massive Data Synthesis for Universal Multimodal Retrieval
authors: Junjie Zhou et al.
year: 2025
url: https://arxiv.org/abs/2412.14475
ideas:
- MegaPairs creates more than 26 million multimodal retrieval training triplets from open-domain image data.
- It mines image pairs with EVA-CLIP semantic similarity, DINOv2 visual-pattern similarity, and EVA-CLIP caption similarity, keeping scores between 0.8 and 0.96.
- InternVL2-26B describes each image pair, and LLaMA 3 8B turns those descriptions into open-ended retrieval instructions.
- The authors train MMRet-Base and MMRet-Large with CLIP backbones, plus MMRet-MLLM with a LLaVA-1.6 backbone.
takeaways:
- Careful synthetic data construction can matter more than dataset size.
notes:
- MegaPairs builds more than 26 million retrieval triplets from a 20-million-image subset of Recap-DataComp-1B.
- It mines semantically related but visually distinct pairs, then uses InternVL2-26B and LLaMA 3 8B to generate descriptions and retrieval instructions.
- Each example combines a query image, an instruction, a target image, and hard negatives to sharpen the retrieval decision.
- Finding: carefully constructed synthetic data can outperform much larger datasets across composed-retrieval benchmarks and the broader MMEB suite.
---
