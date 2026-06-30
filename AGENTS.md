# AGENTS.md

## Project Goal
This repository contains an Electron application for assembling and imposing images on A4 pages, with PDF export.

## Development Rules
- keep the interface simple, clear, and focused on productivity
- preserve the drag-and-drop import flow
- prioritize consistency between preview and export
- always validate changes with lint/build when possible
- document important changes in `dev-docs`

## Main Structure
- `packages/core` — shared pure logic (types, utils, layout algorithm)
- `packages/ui` — React components, hooks, zustand store, CSS
- `packages/electron` — Electron app (main + preload + renderer entry + webpack)
- `packages/web` — Web app (Vite + entry point + wrangler.toml)
- `dev-docs` — technical and operational documentation

## Commands
- `npm run build -w packages/web` — build web for Cloudflare Pages
- `npm run dev -w packages/web` — dev server web (Vite)
- `npm run build -w packages/electron` — build Electron (main + renderer)
- `npm start -w packages/electron` — dev server Electron (webpack)
- `npx wrangler pages deploy packages/web/dist --project-name=imposition` — manual deploy (deploy oficial é via GitHub Actions; não usar CLI)

## Important Notes
- the app must accept JPG, PNG, and WEBP
- the default page is A4
- auto placement must be deterministic and allow randomized attempts
- PDF export must exactly reflect the visual layout
- when changing packages/core or packages/ui, verify the build of both consumers (web + electron)
- never use `workspace:*` (npm does not support it); use `"*"` to reference workspace packages
