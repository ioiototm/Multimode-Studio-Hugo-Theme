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
  # Only show these modes on the homepage (default: all six)
  # modes = ["code", "game", "art", "music", "research", "writing"]

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

### Resources & links

Projects (and other content) can have embedded widgets, video players, and download cards
via the `resources` front matter. They also get simple button-style links via `links`.

```yaml
---
title: "My Game"
links:
  github: "https://github.com/you/repo"
  itch: "https://you.itch.io/game"
resources:
  - title: "Play on itch.io"
    type: "itch"
    id: "1234567"          # the numeric game ID from itch

  - title: "Gameplay Trailer"
    type: "youtube"
    id: "dQw4w9WgXcQ"      # the YouTube video ID
    description: "Optional subtitle text."

  - title: "Source Files"
    type: "zip"
    url: "https://files.example.com/source.zip"
    description: "Full project archive."
    size: "48 MB"           # optional, auto-calculated for local files

  - title: "Design Document"
    type: "pdf"
    url: "/downloads/design-doc.pdf"
---
```

**Resource types:**

| `type` | What it renders |
|--------|----------------|
| `itch` | Embedded itch.io widget (needs `id`) |
| `youtube` | Embedded YouTube player (needs `id`) |
| `zip`, `unity`, `godot`, `code`, `exe` | Download card with code icon |
| `blender`, `csp`, `psd`, `art`, `image` | Download card with art icon |
| `flp`, `wav`, `mp3`, `music`, `audio` | Download card with music icon |
| `video`, `timelapse`, `mp4` | Download card with video icon |
| `pdf` or anything else | Download card with document icon |

Each type gets a matching accent color from the mode palette (`--tone-game`, `--tone-art`, etc.).
Local files (paths starting with `/`) get their size auto-calculated if you don't set `size`.

**Links** show up as simple buttons below the resources. Supported keys:
`demo`, `github`, `pdf`, `doi`, `video`, and anything else (auto-capitalised).
`itch` is excluded from link buttons since it gets its own embedded widget.

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

### Choosing modes

By default all six modes are active: `code`, `game`, `art`, `music`, `research`, `writing`.
If you don't do research, or you only care about art and music, just list what you want:

```toml
[params]
  modes = ["art", "music", "writing"]
```

This controls the homepage hero chips, feed filter, signal cards, timeline, and nav tabs.
Nav tabs with a matching `mode` param are automatically hidden when that mode is disabled.
Individual pages in disabled sections still render fine if someone visits them directly —
they just won't be promoted on the homepage.

---

## Future

Some things that would be nice but aren't done yet:

- **Custom modes** — define your own modes beyond the built-in six, with custom colors and icons
  (e.g. `electronics`, `photography`). Right now the mode colors and gadget styles are in CSS,
  so adding new ones means editing the stylesheet.
- **Configurable signal card count** — currently shows up to 6 (one per active mode), capped by
  however many modes you have.

---

## License

Unlicense — public domain.

Do whatever you want with it. Credit is nice but not required.
