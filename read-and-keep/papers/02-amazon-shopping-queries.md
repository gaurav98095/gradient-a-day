---
index: 02
category: Dataset
title: Shopping Queries Dataset: A Large-Scale ESCI Benchmark for Improving Product Search
authors: Chandan K. Reddy et al.
year: 2022
url: https://arxiv.org/abs/2206.06588
ideas:
- The paper introduces a large-scale product-search dataset built from Amazon’s catalog and shopping-query traffic.
- Instead of binary relevance, each query-product pair receives an ESCI label: Exact, Substitute, Complement, or Irrelevant.
- The dataset includes human annotations in English, Japanese, and Spanish, making it useful for multilingual product-search evaluation.
takeaways:
- ESCI is the important markup: it distinguishes a product that satisfies the query from a viable alternative, an add-on, and a non-match.
- Query selection uses signals such as regex patterns and negations, click distributions, and price patterns to create a broad and useful set of shopping queries.
- The labels make it possible to evaluate ranking systems on more than “relevant versus not relevant,” especially when substitutes and complements should be treated differently.
notes:
- Key point for me: ESCI-style markup — Exact, Substitute, Complement, Irrelevant.
- Exact means the product directly satisfies the shopper’s intent; Substitute is an alternative that could satisfy it; Complement is related but intended to be used alongside the queried product; Irrelevant does not satisfy the intent.
- The catalog connection is important: the examples are grounded in real Amazon products rather than an abstract query-document collection.
- The multilingual portion covers English, Japanese, and Spanish data.
- Candidate-query selection considers negations and other patterns, observed click distributions, and price-related patterns.
---
