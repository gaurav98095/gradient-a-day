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
- Each training example asks a model to move from a query image and natural-language instruction to a target image, with hard negatives included to sharpen the retrieval decision.
- The source pool is a 20-million-image subset of Recap-DataComp-1B; the pipeline turns broad open-domain imagery into targeted retrieval supervision.
- MMRet is evaluated across composed-retrieval benchmarks including CIRCO, CIRR, FashionIQ, and GeneCIS, then checked against the broader 36-task MMEB suite.
- The comparison with MagicLens suggests that careful example construction can matter more than simply adding more training images.
---
