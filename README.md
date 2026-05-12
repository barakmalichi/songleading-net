# Lyric Slide Studio

A production-minded MVP for creating clean lyric slides for worship leaders, songleaders, teachers, camp leaders, and event leaders.

## What it does

- Create, edit, duplicate, delete, and search songs.
- Paste lyrics and auto-detect Verse, Chorus, Pre-Chorus, Bridge, Tag, Ending, Outro, Refrain, and Call and Response sections.
- Edit, rename, split, merge, duplicate-by-flow, delete, reorder, hide-by-excluding, and mark sections as optional or commonly repeated.
- Build a lyric flow without copying repeated choruses manually.
- Select or unselect individual lines.
- Add manual slide breaks between lines.
- Preview slides live with thumbnails.
- Customize themes, colors, font size, line spacing, margins, alignment, title, section labels, slide numbers, copyright footer, and 16:9 or 4:3 format.
- Save songs and saved flows in local storage.
- Create, edit, duplicate, delete, and search sessions.
- Add saved songs to sessions, reorder them, choose saved lyric versions, and save unfinished sessions.
- Present directly in fullscreen.
- Export to PDF through the browser print dialog.
- Supports English and Hebrew/right-to-left lyric text through automatic text direction.

## Setup

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.

`npm install && npm run dev` also works if npm is your preferred package manager.

## Data storage

This MVP stores songs and sessions in browser local storage under `lyric-slide-studio:v1`. The code is structured around a small storage module so IndexedDB or cloud sync can be added later.

## Current limitations

- PDF export uses the browser print/save-as-PDF flow.
- PowerPoint, PNG/JPG, and ZIP export are intentionally left as next-step export adapters.
- Drag-and-drop is represented with reliable Up/Down controls in the MVP to keep the first version dependency-light.
- Saved flow management currently keeps one primary flow per song, with the data model ready for multiple named flows.

## Important product boundary

This app is only for readable lyric slides. It intentionally does not include chords, keys, tempo, capo, BPM, audio playback, or music notation.
