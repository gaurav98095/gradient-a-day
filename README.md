# Gradient a day

Read something. Keep the idea. Share the good parts.

Gradient a day is a tiny personal newsletter built from Markdown notes—a place to keep learning resources and share the ideas worth passing on.

- **Brief** — short paper summaries.
- **Lab** — experiments, code, and deeper explanations.

## Add a note

Create a file in `notes/brief/` or `notes/lab/`:

```md
---
title: A clear title
date: 2026-10-15
topic: embeddings
mode: brief
author: Paper authors
summary: One short line for the homepage.
---

The note goes here.
```

Use fenced code blocks and images when needed:

````md
```python
print("Keep it simple")
```
````

Store images in `assets/` and reference them as:

```md
![A useful diagram](assets/my-note/diagram.png)
```

## Preview

Regenerate the note manifest after adding or moving notes:

```bash
node build.mjs
```

Serve the site locally:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>.

Push to `main` to deploy through GitHub Pages.
