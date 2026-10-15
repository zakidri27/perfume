# Perfume

Perfume — offline-first Electron desktop app for managing perfume inventory and sales. Built with Electron, React, Vite and SQLite (better-sqlite3). Bilingual (Arabic/English) with RTL support.

## Features

- Add, edit, delete products (name, description, price, stock)
- Secure IPC via preload + contextIsolation + sandbox
- SQLite storage via better-sqlite3 (persists in userData/perfume.db)
- Arabic UI with RTL layout

## Tech Stack

- Electron, React, Vite
- better-sqlite3
- SQLite

## Getting Started

```bash
pnpm install
pnpm dev
```

## Build & Run

```bash
pnpm build
pnpm start
```

## License

ISC
