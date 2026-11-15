---
index: 03
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
- Clean synthetic data can outperform much larger existing datasets.
notes:
- Each example is a composed-retrieval triplet: query image, text instruction, and target image, with hard negatives for training.
- The mining starts from a 20-million-image subset of Recap-DataComp-1B and combines complementary similarity signals rather than relying on one model.
- The 0.8–0.96 similarity range balances relatedness with diversity and avoids weak matches or near-duplicates.
- MMRet models are evaluated on composed image retrieval benchmarks such as CIRCO, CIRR, FashionIQ, and GeneCIS, as well as the 36-task MMEB benchmark.
- A useful comparison is that a small MegaPairs subset can outperform MagicLens trained on far more data, showing the value of data quality and construction.
---
