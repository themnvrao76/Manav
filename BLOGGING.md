# Publishing a blog post

This site uses Jekyll on GitHub Pages.

## Add a post

Create a Markdown file in `_posts/` using this filename format:

```
YYYY-MM-DD-your-post-slug.md
```

Example:

```
_posts/2026-10-03-understanding-jepa.md
```

Start the file with:

```yaml
---
title: "Understanding JEPA"
description: "A practical research note on joint-embedding predictive architectures."
date: 2026-10-03
tags: [JEPA, self-supervised learning, world models]
---
```

Then write normal Markdown below it. Commit the file to `master`. GitHub Pages will rebuild the site and the post will appear automatically at:

```
https://manavbarot.com/blog/understanding-jepa/
```

## Images

Put images under:

```
assets/images/blog/
```

Reference them in Markdown:

```md
![Alt text](/assets/images/blog/example.png)
```
