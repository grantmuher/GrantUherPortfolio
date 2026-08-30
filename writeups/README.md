# Project Writeups (Markdown)

This directory contains the Markdown source files for all project technical writeups.

## How to Edit an Existing Writeup

Simply open any `.md` file in this directory (e.g., `bspd.md`, `digital.md`, `relay.md`) and edit standard Markdown text, headings, tables, or images. The portfolio website automatically fetches and renders the updated Markdown at runtime on the dedicated Writeup page (`writeup.html?project=[name]`).

No changes to HTML are required!

## File Structure & Frontmatter Options

Each markdown file can optionally start with YAML frontmatter at the top:

```markdown
---
title: Project Title
subtitle: Brief description of the project
project: project-id
badge: Safety Circuit
badgeClass: badge-safety  # Options: badge-safety, badge-daq, badge-power
schematic: assets/docs/your-schematic.pdf
model3d: projects.html#project-card-1
topView: assets/PCB3d_Models/Your_TopView.png
date: 2024 - 2025
tech:
  - Altium Designer
  - High-Speed Routing
  - Discrete Logic
---

# Writeup Content Starts Here...
```

## Markdown Features Supported
- **Headers:** `# Heading 1`, `## Heading 2`, `### Heading 3`
- **Tables:** Full GitHub Flavored Markdown tables (`| Col 1 | Col 2 |`)
- **Images:** `![Alt text](image_path.png)`
- **Code Blocks:** ` ```c ... ``` `
- **Callouts / Quotes:** `> Important note text`
- **Lists:** Bulleted, numbered, and task lists
