# Time Thief — Proof of Concept

A 2D platformer with a time-travel mechanic where the player switches between past and present to navigate levels and avoid guards.

**Team:** Ernie Jennison, Waheed Khan, Evangel Hightower-Rojas, Serena Heath, Joshua Peterson

**Engine:** Phaser 3 with Arcade Physics

```mermaid
flowchart TB
    subgraph Init["Initialization"]
        A["index.html<br/>Loads Phaser 3 CDN + main.js"] --> B["src/main.js<br/>Phaser.Game Config<br/>WEBGL · 800x448 · Arcade Physics"]
        B --> C["BootScene<br/>Starts PreloadScene"]
    end

    subgraph Loading["Asset Loading"]
        C --> D["PreloadScene"]
        D --> E["Load Assets<br/>Spritesheets · Tilesets<br/>Tilemap JSON · Audio"]
        D --> F["Create Animations<br/>idle · walk · jump"]
        D --> G["Studio Intro<br/>Tween chain + loading bar"]
        G --> H["MenuScene<br/>'TIME THIEF' title<br/>'START GAME' button"]
    end

    subgraph Gameplay["Core Gameplay"]
        H --> I["GameScene<br/>Runs in parallel with UIScene"]
        I --> J["Create Tilemap<br/>bg layer + main collision layer"]
        I --> K["Create Player<br/>period='both'<br/>speed=140 · jumpForce=-370"]
        I --> L["Create Guards<br/>Guard_Past · Guard_Present<br/>patrol routes + chase AI"]
        J --> M["Arcade Physics<br/>Characters vs tile layer<br/>Player vs guards"]
        K --> M
        L --> M
        I --> N["Set up Input<br/>Cursor keys · T key<br/>Mobile buttons via registry"]
        I --> O["Camera<br/>Follows player · zoom=2.5"]
    end

    subgraph FrameLoop["Every Frame (update)"]
        N --> P["handleInput()"]
        P --> Q["Move left/right · Jump<br/>Play walk/idle/jump anim<br/>Play jump SFX (synthesized)"]
        L --> R["manageGuards()"]
        R --> S{"Active in<br/>current period?"}
        S -- Yes --> T{"Player within<br/>chase range?"}
        T -- Yes --> U["Chase player<br/>Move toward · Jump if reachable"]
        T -- No --> V["Patrol waypoints<br/>Reverse at route end"]
        S -- No --> W["Freeze guard<br/>stopMoving + skip"]
    end

    subgraph TimeTravel["Time Period Switching"]
        I --> X["Press T key"]
        X --> Y{"Player<br/>mid-air?"}
        Y -- Yes --> Z["Block switch"]
        Y -- No --> AA["Camera shake (100ms)"]
        AA --> AB["Launch TransitionScene<br/>Fade to black · Callback · Fade from black"]
        AB --> AC["Toggle period<br/>past ⟷ present"]
        AC --> AD["Update registry 'timePeriod'<br/>Emit 'periodChanged' event"]
        AD --> AE["Camera flash (200ms white)"]
        AD --> AF["Play time-switch SFX<br/>Synthesized sawtooth sweep<br/>200Hz → 1200Hz"]
    end

    subgraph UI["UI Overlay (Parallel Scene)"]
        I -.-> AG["UIScene<br/>Launched by GameScene"]
        AG --> AH["HUD Background + Text<br/>'PAST' / 'PRESENT' indicator<br/>Gold / Blue styling"]
        AG --> AI["Mobile Touch Buttons<br/>◀ Left · ▶ Right · ▲ Jump · ⚡ Time"]
        AD -.-> AJ["Listen 'periodChanged'<br/>Update HUD text"]
    end

    subgraph Audio["Audio System"]
        AC --> AK["AudioManager<br/>Singleton (Web Audio API)"]
        AK --> AL["Background Music<br/>mainTheme.wav · loop · vol 0.5"]
        AK --> AM["Synthesized SFX<br/>Jump: triangle 400→600Hz<br/>Switch: sawtooth 200→1200Hz"]
    end

    subgraph Data["Data Layer"]
        I --> AN["src/levelData.js<br/>LEVELS array<br/>Past/present tile grids"]
        I --> AO["lib/json/castleMap0.json<br/>Tiled tilemap 25×14<br/>bg + main layers"]
        D --> AP["lib/json/assetLoader.json<br/>Sprite tileset definitions"]
        D --> AQ["lib/json/musicLoader.json<br/>Audio asset definitions"]
    end

    style Init fill:#1a1a2e,color:#eee,stroke:#16213e
    style Loading fill:#1a1a2e,color:#eee,stroke:#16213e
    style Gameplay fill:#16213e,color:#eee,stroke:#0f3460
    style FrameLoop fill:#0f3460,color:#eee,stroke:#533483
    style TimeTravel fill:#533483,color:#eee,stroke:#e94560
    style UI fill:#2d1b69,color:#eee,stroke:#e94560
    style Audio fill:#1a3a2e,color:#eee,stroke:#2d6a4f
    style Data fill:#1a2a3e,color:#eee,stroke:#2d4a6f
```

---

## Requirements Coverage

### Audio

| Kind | Implementation | Location |
|---|---|---|
| **1. Continuously looping background sound** | `mainTheme.wav` loaded via Phaser's sound manager and looped at volume 0.5. Started when the player clicks "START GAME" on the menu. | `PreloadScene.js` (loads via `musicLoader.json`), `AudioManager.js` `startMusic()` |
| **3. Dynamically-generated sounds** | Synthesized via Web Audio API oscillators: a bubbly two-tone triangle-wave jump SFX (400 Hz → 600 Hz) and a sawtooth frequency-sweep time-switch SFX (200 Hz → 1200 Hz) with custom attack/decay envelopes. A programmatic 4-bar sine-wave music loop (C4–E4–G4–A4) also serves as a fallback. | `AudioManager.js` `playJumpSound()`, `playSwitchSound()`, `playMusicLoop()` |

### Visual

| Kind | Implementation | Location |
|---|---|---|
| **1. Image-based assets (sprites & tilesets)** | Player spritesheet (`mcSpriteSheet.png`, 20×32 px, 9 frames for idle/walk/jump) and a 7-tile tileset (`levelTileset0.png`, 16×16 px each). | Loaded via `assetLoader.json` in `PreloadScene.js` |
| **2. Non-image asset (tilemap)** | Level layout authored in Tiled (`castleMap0.json`, 25×14 grid, two layers `bg`/`main`) with tileset references, rendered via Phaser's tilemap system. | `GameScene.js` `create()` |
| **3. Procedurally-defined vector graphics** | Loading bar (filled rect), HUD period indicator, mobile touch buttons with rounded rects and strokes, transition fade overlay, and guard debug vision rings (circle, 0xfeed4f, 25% alpha) — all drawn via `Phaser.GameObjects.Graphics`. | `PreloadScene.js`, `UIScene.js`, `TransitionScene.js`, `Guards.js` |

### Motion

Smooth motion appears throughout the core mechanic:

- **Player movement** — velocity-based horizontal movement (`speed: 140`) and jumping with gravity (`jumpForce: -370`) via Arcade Physics, updated every frame in `GameScene.handleInput()`.
- **Guard AI chasing** — guards detect the player within a configurable `Phaser.Geom.Ellipse` chase range and move toward them at `speed: 180`, with the ability to jump to reach targets within `verticalReach`.
- **Guard patrol** — waypoint-based patrolling between defined route points, reversing direction when all waypoints are reached.
- **Tweened transitions** — studio logo scale/color/fade chain in PreloadScene (`tweens.chain()`), fade-to-black/fade-from-black for time travel (`tweens.addCounter()`), and camera shake + flash effects on period switch.

### Progression

The prototype establishes a data-driven level progression system:

- **Multi-level infrastructure** — `src/levelData.js` exports an array `LEVELS` where each entry defines a level ID, name, player start position, and separate tile grids for past and present periods. Currently one level ("PoC Level") is populated; additional levels can be added by appending to this array.
- **Persistent state** — every `GameObject` carries a `persistentState` property intended to track changes that survive across time-period switches (e.g., objects moved in the past affecting the present).
- **Planned difficulty scaling** — future levels would introduce more complex guard patrol routes, tighter platforming, and additional guard types, with progression gated by completing earlier levels.

### Prefabs

| Kind | Implementation | Location |
|---|---|---|
| **1. GameObject subclass hierarchy** | `GameObject` (extends `Phaser.Physics.Arcade.Sprite`) → `Player`, `Guard_Generic` → `Guard_Past`, `Guard_Present`. The base class provides period-awareness (visibility + physics toggling), shared movement methods, and `persistentState`. | `src/objects/GameObject.js`, `Player.js`, `Guards.js` |
| **3. Design presets in program code** | `src/levelData.js` contains a JSON-structured array of level configs with player start coordinates and per-period 25×14 tile grids, all defined inline as JavaScript objects. | `src/levelData.js` |
| **4. Design presets in data files** | External JSON files decouple asset configuration from code: `assetLoader.json` (sprite sheet definitions), `musicLoader.json` (audio asset paths), `castleMap0.json` (Tiled tilemap with two layers), and `castle0.json` / `castleTileset.json` (tileset metadata). | `lib/json/` |
