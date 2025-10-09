<!--
Guidance for AI coding agents working on SCTavernVoidSeekerPublic
Keep this file short, specific, and focused on discoverable patterns.
-->

# Copilot instructions — SCTavernVoidSeekerPublic

Quick orientation
- Purpose: a small client-side web app (single-page HTML + vanilla JS) that helps deduce a hidden "prophecy" card based on player "guesses". Data is stored as simple JSON card sets in `data/*.json`.
- Entry points: `index.html` (UI), `app.js` (application logic), `data/*.json` (datasets). No build step — files are static and expected to be served by GitHub Pages.

Architecture & major components
- UI: `index.html` is the single page; it wires `app.js` at the bottom and calls `window.App.init()` on DOMContentLoaded.
- State & logic: `app.js` exposes a single global `App` object that holds `state` (cards, guesses, sort preference, filters) and methods to initialize, load datasets, persist to localStorage, and render the UI.
- Data: card records follow the shape { id, race, level, number, value } (see `data/core.json`). `app.js` also accepts JSON or CSV file uploads via `loadFile`/`parseCsv`.

Important code patterns and conventions
- All UI rendering is done as string templates in `app.js` (no framework). When editing rendering code, preserve existing innerHTML usage and event-binding pattern (render then attach event listeners) — e.g. `renderHistory()` creates rows then queries `button[data-action="remove"]` to hook click handlers.
- Dataset merging: `handleCombineSets()` fetches multiple `data/*.json`, adds an `isCoreSet` flag, de-duplicates by `id` using a Map, and sets `state.cards` via `setCards()`.
- Filtering rules: candidate consistency is computed by `candidateConsistent(candidate)` which iterates over recorded guesses and uses `isClose(a,b)` to check signals. The exact closeness rule is: same race, same unit `number`, or absolute `value` difference <= CLOSE_THRESHOLD (200). Don't change this behavior unless you also update tests/UI language.
- Normalization helpers: `normalizeRace()` and `normalizeLevel()` standardize data. Use them when importing or transforming datasets.

Developer workflows (how to run / debug)
- Serve files from a static web server. When opening `index.html` via file:// the app will try to fetch `data/*.json` and fail; the UI warns to run a local server. Example quick commands (Windows PowerShell):
  - Python 3: `python -m http.server 8000` (run from repo root)
  - Node: use `npx http-server -p 8000` if you prefer node-based servers
- Open `http://localhost:8000/` in a browser and use DevTools Console to inspect `window.App` and state. `window.App.state` and `window.App.getCandidates()` are convenient for debugging.
- Persistence: app saves guesses and sort preference to `localStorage` key `gac_state_v1`. Clear or edit localStorage during debugging to reset state.

Files & examples to reference
- `index.html` — contains the DOM nodes that `app.js` expects (IDs: `raceSelect`, `levelSelect`, `cardSelect`, `addGuessBtn`, `historyTable`, `candidatesTable`, dataset toggles). When changing element IDs update `cacheEls()` accordingly.
- `app.js` — main logic. Notable constants: `CLOSE_THRESHOLD = 200`, `RACES = ["Protess","Zerg","Terran","Neutral"]`, `BUILTIN_SET_FILES` mapping. Key methods: `init`, `handleCombineSets`, `setCards`, `candidateConsistent`, `isClose`, `getCandidates`, `persist`, `restoreFromUrlOrStorage`.
- `data/*.json` — arrays of card objects. Example record: { "id": "折跃援军", "race": "Protess", "level": 1, "number": 4, "value": 550 }.

Testing & safety notes for edits
- Keep everything client-side and avoid adding server-only dependencies. The repository is intended for static hosting.
- When adjusting filtering or closeness logic, update the UI copy in `index.html` (the explanatory text in the rules block) and ensure `renderCandidates()` behavior still matches the text.
- Avoid changing the `id` semantics: card `id` is the primary dedup key used across UI and persistence. If you alter the shape, update `persist()`/`restoreFromUrlOrStorage()` accordingly.

What not to do
- Don't introduce bundlers or heavy frameworks without the author's sign-off—this is a deliberately tiny static app.
- Don't assume a backend or authentication; the app uses localStorage and static JSON datasets.

If something's unclear
- Ask for clarification about desired UX changes (e.g., what "close" should mean) and whether adding a simple build/test pipeline is acceptable.

---
If you'd like, I can also add a small `CONTRIBUTING.md` or a debug helper in `app.js` to make future PRs easier. What should I add next?
