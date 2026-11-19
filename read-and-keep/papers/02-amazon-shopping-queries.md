---
index: 02
date: 2026-11-14
category: Dataset
title: Shopping Queries Dataset: A Large-Scale ESCI Benchmark for Improving Product Search
authors: Chandan K. Reddy et al.
year: 2022
url: https://arxiv.org/abs/2206.06588
keywords:
- ESCI
- Amazon
- shopping queries
- product search
- query-product relevance
- exact
- substitute
- complement
- irrelevant
ideas:
- Real Amazon query-product pairs, labeled by humans.
- ESCI replaces binary relevance: Exact, Substitute, Complement, Irrelevant.
- Queries cover English, Japanese, and Spanish, selected using search and shopping signals.
takeaways:
- Search relevance is not binary; substitutes and complements should be modeled separately.
- ESCI's four-way relevance scheme is the main idea I want to remember.
notes:
- ESCI contains human-labeled Amazon query–product pairs in English, Japanese, and Spanish.
- Its four labels—Exact, Substitute, Complement, and Irrelevant—capture shopping intent beyond binary relevance.
- Finding: the labels make ranking errors easier to diagnose because useful substitutes and complements are separated from exact matches.
---
