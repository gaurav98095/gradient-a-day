---
index: 02
category: Dataset
title: Shopping Queries Dataset: A Large-Scale ESCI Benchmark for Improving Product Search
authors: Chandan K. Reddy et al.
year: 2022
url: https://arxiv.org/abs/2206.06588
ideas:
- Real Amazon query-product pairs, labeled by humans.
- ESCI replaces binary relevance: Exact, Substitute, Complement, Irrelevant.
- Queries cover English, Japanese, and Spanish, selected using search and shopping signals.
takeaways:
- Product relevance is more nuanced than relevant or irrelevant.
- ESCI is the main idea I want to remember.
notes:
- The dataset is most useful when evaluating whether search systems understand the relationship between a query and a product, not just whether the product contains matching words.
- Its relevance scheme makes ranking errors more diagnosable: a substitute and a complementary product can both be useful, but they should not be treated as exact matches.
---
