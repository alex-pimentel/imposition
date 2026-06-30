# Architecture

## Overview
The project uses Electron with React and TypeScript. The application is divided into:
- main process (`src/main`)
- renderer process (`src/renderer`)
- preload for secure communication

## Responsibilities
### Main process
- create and control the application window
- handle files and export
- access file system and local resources

### Renderer process
- build the user interface
- manage composition state
- display the A4 page preview
- allow manual and automatic editing

## Suggested structure for evolution
- `src/renderer/components` — visual components
- `src/renderer/hooks` — reusable hooks
- `src/renderer/state` — application state
- `src/main/ipc` — IPC handlers
- `src/shared` — shared types and utilities
