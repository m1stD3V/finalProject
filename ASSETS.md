# Assets — Time Thief

All assets used in this project, with creation credits and sourcing information.

> **How to fill this in:** Replace every `[Team Member]` with the name(s) of whoever made or sourced the asset, and every `[Tool]` with the software used (e.g. Aseprite, Piskel, Audacity, Suno, Photoshop).

---

## Audio

| File | Description | Origin |
|------|-------------|--------|
| `assets/audio/mainTheme.wav` | Title-screen background music loop | Created by Joshua Peterson using FL Studio |
| `assets/audio/levelTheme.wav` | In-level background music loop | Created by Joshua Peterson using FL Studio |

> **Note:** All in-game sound effects (jump, time-switch, caught, win) are synthesized at runtime via the Web Audio API — no audio files are used for SFX. See `src/systems/AudioManager.js`.

---

## Player Sprites

All player frames were created by Joshua Peterson using Aseprite.

| File | Description |
|------|-------------|
| `assets/player/mcSpriteSheet.png` | Full spritesheet (20 × 32 px, 9 frames) used by Phaser's animation system |
| `assets/player/mcIdle0.png` | Player idle frame 0 |
| `assets/player/mcIdle1.png` | Player idle frame 1 |
| `assets/player/mcJump.png` | Player jump frame |
| `assets/player/mcWalk0.png` | Player walk cycle frame 0 |
| `assets/player/mcWalk1.png` | Player walk cycle frame 1 |
| `assets/player/mcWalk2.png` | Player walk cycle frame 2 |
| `assets/player/mcWalk3.png` | Player walk cycle frame 3 |
| `assets/player/mcWalk4.png` | Player walk cycle frame 4 |

---

## Enemy Sprites

| File | Description | Origin |
|------|-------------|--------|
| `assets/enemies/clanker.png` | Robot guard sprite | Created by Joshua Peterson using Aseprite |

---

## Environment / Tileset Graphics

All environment tiles and tilesets were created by Joshua Peterson using Aseprite.

| File | Description |
|------|-------------|
| `assets/environment/levelTileset.png` | Primary level tileset (reference image) |
| `assets/environment/levelTileset0.png` | Active level tileset used in-game (16 × 16 px tiles) |
| `assets/environment/worldTileset.png` | World-view tileset |
| `assets/environment/castleGates.png` | Castle gates decorative element |
| `assets/environment/castleOutFloorCenter.png` | Castle exterior floor — center segment |
| `assets/environment/castleOutFloorL.png` | Castle exterior floor — left end cap |
| `assets/environment/castleOutFloorR.png` | Castle exterior floor — right end cap |
| `assets/environment/castleTowerLayer.png` | Castle tower layered section |
| `assets/environment/floorTiles.png` | Generic floor tile strip |
| `assets/environment/platformCenter.png` | Floating platform — center segment |
| `assets/environment/platformLeft.png` | Floating platform — left end cap |
| `assets/environment/platformRight.png` | Floating platform — right end cap |
| `assets/environment/towerLayers.png` | Tower body layered sprite |
| `assets/environment/towerTop.png` | Tower top / battlements sprite |

---

## UI Graphics

All UI button images were created by Serena Heath using Aseprite.

| File | Description |
|------|-------------|
| `assets/UI/button_left.png` | Mobile touch button — move left |
| `assets/UI/button_right.png` | Mobile touch button — move right |
| `assets/UI/button_jump.png` | Mobile touch button — jump |
| `assets/UI/button_timeTravel.png` | Mobile touch button — switch time period |

---

## Level Data (JSON)

All tilemap JSON files were exported from [Tiled Map Editor](https://www.mapeditor.org/) by Joshua Peterson and Serena Heath. Asset-loader and music-loader manifests were written by hand.

| File | Description |
|------|-------------|
| `json/castleMap0.json` | Tiled tilemap — castle level, map 0 (25 × 14 grid, `bg` + `main` layers) |
| `json/castleMap1.json` | Tiled tilemap — castle level, map 1 |
| `json/castleMap2.json` | Tiled tilemap — castle level, map 2 |
| `json/castleMap3.json` | Tiled tilemap — castle level, map 3 |
| `json/castle0.json` | Tiled tileset definition for the castle maps |
| `json/castleTileset.json` | Tileset metadata referenced by castle maps |
| `json/levelTileset.json` | Tileset metadata for the primary level tileset |
| `json/floorTiles.json` | Tileset metadata for floor tiles |
| `json/towerGate.json` | Tileset metadata for the tower gate sprite |
| `json/towerLayers.json` | Tileset metadata for the tower body layers |
| `json/towerTop.json` | Tileset metadata for the tower top |
| `json/levelExample.json` | Example / prototype level map (development reference) |
| `json/level3.json` | Tiled tilemap — Level 3 of final game — Designed by Serena Heath |
| `json/longLevel0.json` | Extended level map for level 0 — Designed by Joshua Peterson |
| `json/assetLoader.json` | Manifest that maps asset keys to file paths for Phaser's loader |
| `json/musicLoader.json` | Manifest that maps music keys to audio file paths |
