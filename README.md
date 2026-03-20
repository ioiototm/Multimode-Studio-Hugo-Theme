# multimode-studio · Hugo theme

A Hugo theme I built for my own site. It treats a personal site like a small studio workspace —
code, games, art, music, research, and writing all in one place, instead of picking one thing
and hiding the rest.

The UI borrows from tools I actually use: VS Code tabs for navigation, a terminal in the footer,
lane-based filtering like a DAW mixer. Dark mode first because obviously.

I made this for me. If it works for you, cool.

---

## What's in it

**Homepage** — hero section, lane filter chips (code / game / art / music / research / writing),
a "/now" panel, signal cards for latest project / track / paper, and a combined feed of everything.

**Navigation** — tabs styled like editor tabs: `Home.md`, `Projects.ts`, `Art.png`, `Music.wav`, etc.

**/me page** — pulls from `data/profile.yaml`. Bio, skills, education, experience, what you're working on.

**Footer terminal** — a fake PowerShell window that runs `cat copyright.txt` and `ls ./socials`.
Supports custom commands via `data/terminal.yaml` (I use it for easter eggs).

**Theming** — CSS variables, dark/light toggle, everything in one stylesheet.

**Multimode feed** — content gets assigned to lanes based on its section folder. You can override
with `modes` in front matter if something belongs in multiple lanes.

---

## Requirements

- Hugo **extended** `v0.120.0`+
- That's it

---

## Installation

```bash
git submodule add https://github.com/ioiototm/multimode-studio-hugo-theme.git themes/multimode-studio
```

In `hugo.toml`:

```toml
theme = "multimode-studio"
```

Or just clone / download it into `themes/multimode-studio`, whatever works.

---

## Configuration

### `hugo.toml`

```toml
title = "Your Name"
baseURL = "https://example.com/"
languageCode = "en-gb"
theme = "multimode-studio"

[pagination]
  pagerSize = 12

[taxonomies]
  tag = "tags"
  stream = "streams"

[params]
  author = "Your Name"
  terminal_title = "Administrator: my-shell"

  [params.hero]
    title = "Your Name: code + games + art + music + research"
    subtitle = "A small studio of one."

  [[params.social]]
    name = "GitHub"
    url  = "https://github.com/yourname"

  [[params.social]]
    name = "Bluesky"
    url  = "https://bsky.app/profile/yourname.example"
```

### `data/profile.yaml`

This drives the `/me` page. Here's the shape of it:

```yaml
name: "Your Name"
tagline: "What you do in one line"
role: "Your role"
location: "Somewhere"
availability: "Open to whatever"
intro: "One-liner for the /me hero."

about:
  paragraphs:
    - "A paragraph about you."
    - "Another one if you want."

workingOn:
  - title: "Cool Project"
    description: "One sentence."
    link: "https://example.com"

passions:
  - "Thing you care about."

skills:
  - category: "Programming"
    items: ["C#", "Python", "Rust"]

education:
  - degree: "PhD in Something"
    place: "University of Somewhere"
    years: "2019 – 2025"

experience:
  - role: "Your Job"
    org: "Some Place"
    years: "2023 – Present"
```

Also supports: `researchHighlights`, `openSourceBeliefs`, `interests`, `portraitDownload`.

### `data/terminal.yaml`

Virtual filesystem and custom commands for the footer terminal:

```yaml
files:
  about.md: "Whatever you want cat to print."
  secret.txt: "Easter egg hints go here."

showInHelp: false

commands:
  marmalade:
    description: "A CC0 catgirl"
    output: "Opening marmalade.you..."
    open: "https://marmalade.you"
```

---

## Content

The theme expects these section folders:

| Folder | What | Feed lane |
|--------|------|-----------|
| `content/posts/` | Blog posts | `writing` |
| `content/projects/` | Code / game projects | `code` |
| `content/art/` | Art / gallery | `art` |
| `content/music/` | Tracks / releases | `music` |
| `content/publications/` | Research papers | `research` |
| `content/now/` | /now page | — |
| `content/me/` | /me page | — |

Front matter example:

```yaml
---
title: "My Project"
date: 2025-11-20
type: "projects"
summary: "What it is in one line."
tags: ["code", "game"]
modes: ["code", "game"]  # optional, overrides the default lane
---
```

---

## Styling

Everything lives in `assets/css/style.css`. The theme uses Hugo Pipes with fingerprinting
for cache busting, so you don't need to worry about that.

The JS is minimal:
- `assets/js/mode.js` — dark/light toggle + feed lane filtering
- `assets/js/gallery.js` — image lightbox for art pages
- `assets/js/terminal.js` — the footer terminal

Dark/light mode uses `[data-theme="dark"|"light"]` on `<html>` and CSS variables.
If you fork this, you might want to change the localStorage key in `mode.js`:

```js
const KEY = "multimode-studio";
```

---

## License

Unlicense — public domain.

Do whatever you want with it. Credit is nice but not required.
