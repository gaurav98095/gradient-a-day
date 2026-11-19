# Read & Keep

Read & Keep is the paper index at `/read-and-keep/`. It is a small, static HTML/CSS/JavaScript page backed by Markdown paper notes. Its purpose is to preserve the key ideas and findings from papers worth revisiting—not to reproduce full paper summaries.

The user will usually provide two kinds of input after reading a paper:

1. What the paper presents: its method, data, architecture, training objective, experiments, and findings. Put this in the paper modal under “Key ideas & findings.”
2. What the user personally learned or found newly useful: put only this in `takeaways`, because it appears on the first-page table as the paper's Key takeaway.

Do not put familiar background concepts in `takeaways` just because they are part of the paper. The table should answer: “What was new or especially useful to me?”

## Adding a paper

1. Create the next zero-padded file in `papers/`, for example `05-paper-slug.md`.
2. Add the filename to `papers/index.json`.
3. Use this front matter:

```md
---
index: 05
date: 2026-11-19
category: Multimodal representation
title: Full paper title
authors: First Author et al.
year: 2026
url: https://arxiv.org/abs/...
keywords:
- Distinct concept, method, dataset, or acronym users may search for.
- Another useful retrieval term.
ideas:
- What the paper builds or proposes.
- The important architecture, data, or training idea.
- The main result or distinction from prior work.
takeaways:
- A short takeaway for the table.
- An optional second short takeaway.
notes:
- The paper's central idea, stated clearly.
- The key method or training setup.
- The main finding or practical lesson.
---
```

## Writing rules

- Use the canonical paper title, author list, publication year, and paper URL. Check the paper page when metadata is uncertain.
- Add a `keywords` list with distinctive acronyms, methods, datasets, tasks, and concepts that someone might use to find the paper later. Include terms that do not appear in the title.
- `date` means the date the paper was added to Read & Keep, not the paper's publication date. For existing papers, infer it from the first Git commit that added the paper file. For a new paper, use the current date.
- Keep `takeaways` short because they appear directly in the table—usually one or two compact bullets. They must represent the user's new learning or personal insight, not a generic paper summary.
- Make `notes` the useful reading view: roughly three or four concise bullets covering what the paper presents—the core idea, method/data, architecture or training setup, and findings. These appear in the paper dialog under “Key ideas & findings.”
- Preserve the distinction even when the two sections overlap: `notes` explains the paper; `takeaways` records what the user wants to remember from it.
- Use `ideas` for the paper's main concepts and technical presentation; use `notes` for concise supporting details and findings. Both appear in the detail dialog.
- Prefer precise statements over vague praise. Include concrete signals, losses, datasets, model components, or evaluation findings when they are central to the paper.
- Do not invent claims. If a detail comes from the user's recollection rather than the paper, verify it or phrase it as an interpretation.

## Site behavior

- `papers/index.json` is the manifest loaded by `app.js`; every listed Markdown file must exist.
- `app.js` parses the front matter, sorts papers by descending `index`, renders the table, and combines `ideas` plus `notes` in the detail dialog.
- The index includes a compact instant search in the paper-index toolbar. Search matches paper title, category, authors, and `keywords`, so keep keyword metadata useful and specific when changing paper entries. Keep the toolbar minimal so the paper table gets most of the page.
- Keep the existing visual language in `styles.css`: restrained editorial styling, readable typography, compact metadata, and responsive horizontal scrolling for the table.
- If the table structure changes, update the column definitions, headings, loading/error `colspan` values, and responsive styles together.

## Validation

From the repository root:

```bash
node --check read-and-keep/app.js
git diff --check
```

Also verify that `papers/index.json` is valid JSON, every listed paper exists, and each paper has the required front matter fields. For a local preview:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/read-and-keep/`.
