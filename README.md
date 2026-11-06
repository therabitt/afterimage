# Afterimage

**An interactive generative drawing instrument.**

Afterimage turns pointer movement into a temporary image. Move through the canvas, watch the particles drift and fade, then save a moment as a PNG.

> A quiet digital canvas that remembers where you have been, then gradually lets the trace disappear.

## Features

- Responsive Canvas 2D drawing surface
- Mouse, touch, and pen input through Pointer Events
- Distance-based particle emission for consistent trails
- Three curated colour palettes: Aurora, Ember, and Ultraviolet
- Adjustable particle size and trail persistence
- Clear canvas and export the current composition as PNG
- Local preference persistence, with no account or remote storage
- Reduced-motion support and a bounded particle budget

## Technology

React, TypeScript, Vite, Tailwind CSS, and the native Canvas 2D API.

The particle engine is framework-independent. React owns the interface and settings; the engine owns per-frame particle state and canvas rendering.

## Getting started

**Requirements:** Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Available scripts

```bash
npm run dev        # Start the development server
npm run typecheck  # Run the TypeScript checker
npm run build      # Type-check and create a production build
npm run preview    # Preview the production build locally
```

## Using the instrument

- Move your mouse across the canvas to draw.
- Touch and drag on touch-enabled devices.
- Choose a colour field and tune particle size or afterglow.
- Select **Clear canvas** to begin again.
- Select **Save image** to download the current canvas as a PNG.

Your drawing stays in the current browser session. Only the selected visual preferences are stored locally in browser storage. Artwork and pointer movement are not uploaded.

## Project structure

```text
src/
├── app/          # Application composition and UI state
├── components/   # Canvas, controls, icons, and feedback
├── engine/       # Imperative Canvas 2D particle engine
├── hooks/        # React integration and reduced-motion preference
├── settings/     # Defaults, validation, and local persistence
├── types/        # Shared TypeScript contracts
└── utils/        # PNG download helpers
```

## Current scope

This is the first focused release. It intentionally does not include accounts, a backend, cloud saves, a public gallery, or a full image-editing toolset.

## Name note

Afterimage is a working project name for this learning experiment. The name has not been cleared for commercial use, and no domain or trademark availability is implied.
