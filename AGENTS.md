<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Thumbnail Anti-Slop Technical Guide

Welcome to the **Thumbnail Anti-Slop** codebase. This guide provides AI agents and human developers with an accurate, end-to-end understanding of the system's architecture, conventions, domain rules, and workflows.

---

## 1. PROJECT OVERVIEW

**Thumbnail Anti-Slop** is a specialized Next.js web application designed to generate, purify, and audit YouTube thumbnail visual prompts for modern AI image generators (OpenAI GPT Image 2.5, Google Nano Banana, Midjourney V8.2/Niji 7, FLUX.2, and neutral engines).

### Core Problem Solved
Generic AI image generators and amateur thumbnail prompts default to "AI slop":
- Exaggerated open-mouth gasping/screaming expressions ("YouTube face").
- Plastic/waxy skin smoothing ("same-face syndrome", beauty filters).
- Unmotivated neon blue/purple lighting and lens flares.
- Floating embers, random sparks, and fire particles.
- Distorted physical hardware, melted buttons, and extra fingers.
- Hallucinated domestic rooms (gaming bedrooms, RGB desks, sofas) when not requested.

### Key Capabilities & User Modes
The UI provides **Radical Simplicity** across three dedicated modes:
1. **CRIAR (Create)**: Accepts video title, conversational concept description, text overlay, and multiple reference images (with assigned visual roles). Outputs 5 visual direction decisions (Idea, Focus, Composition, Expression, Lighting), a provider-formatted photographic prompt, and generation approach variants.
2. **MELHORAR (Improve / Purify)**: Accepts a user's noisy prompt full of AI slop buzzwords, strips artificial clich\u00e9s, translates vague concepts into physical camera/lighting language, and returns educational change notes along with a purified prompt.
3. **ANALISAR (Analyze)**: Performs ethical visual audit of an uploaded thumbnail (detecting artificial lighting, waxy skin, distorted hardware) without fake numerical CTR scores, providing surgical repair prompts.

### System Architectural Philosophy
- **Local Rule Authority**: The local deterministic reasoning engine (`src/lib/simpleEngine/engine.ts`) is the ultimate authority.
- **Multimodal AI Director**: Interprets uploaded reference images and user intent, providing visual facts without overriding hard constraints.
- **Complementary Visual Auditor**: An optional secondary model (Gemini) that audits the proposed prompt for reference leakage or slop risks without rewriting prompts directly.
- **100% Deterministic Fallback**: If no AI API keys (`OPENAI_API_KEY`, `GEMINI_API_KEY`) are configured or if external calls fail/timeout, the deterministic engine handles 100% of the workflow offline with zero user disruption.

---

## 2. TECH STACK

| Category | Technology | Version | Project Role |
|---|---|---|---|
| **Language** | TypeScript | `^5.0.0` | Strict static typing across all modules (`strict: true`, `allowImportingTsExtensions: true`) |
| **Framework** | Next.js (App Router) | `16.3.6` | Fullstack framework, React Server Components + client-side interactive modes, API Route Handlers |
| **Frontend Runtime** | React / React DOM | `19.2.8` | Client-side reactive interface with hooks (`useState`, `useMemo`, `useRef`) |
| **Styling** | Tailwind CSS (PostCSS) | `^4.0.0` | Minimalist dark-mode utility styling (`#090a0d` base, amber accents, zinc palettes) |
| **Icons** | Lucide React | `^1.48.0` | UI iconography (`Wand2`, `Sparkles`, `History`, `Upload`, etc.) |
| **State Management** | React State + `localStorage` | Native | Zero external state stores; history stored client-side in browser `localStorage` (`tas_simple_history_v1`) |
| **Backend Runtime** | Node.js | `>=18` (tested on Node 26) | Server runtime for Next.js route handlers |
| **Testing** | Node.js Native Runner (`node:assert/strict`) | Built-in | Fast headless test suite executed with `node --experimental-strip-types` (25 test suites, 0 external test dependencies) |
| **Linter / Formatter** | ESLint | `^9.0.0` (`eslint-config-next`) | Code style and lint enforcement |
| **External AI Providers** | OpenAI API & Google Gemini API | REST / Fetch | OpenAI GPT-4o (`OpenAIDirector`) & Gemini 2.5 Flash (`GeminiDirector`, `GeminiAuditor`) |

---

## 3. HOW TO RUN THE PROJECT

### Prerequisites
- Node.js `>= 18.0.0` (Node 20+ or 26 recommended).
- npm (or pnpm / yarn).

### Commands

```bash
# Install dependencies
npm install

# Run development server (runs at http://localhost:3000)
npm run dev

# Run unit and heuristic test suite (25 suites, 0 failures)
npm test

# Run TypeScript type check
npx tsc --noEmit

# Run ESLint linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### Server Verification Check
To verify server health via command line (PowerShell on Windows):
```powershell
# Using curl.exe (do not use PowerShell curl alias without .exe)
curl.exe -s http://localhost:3000/api/ai/status
```
Expected response when unconfigured:
```json
{"localEngine":true,"director":{"configured":false,"provider":"none"},"auditor":{"configured":false,"provider":"none"},"configured":false,"provider":"Motor Local Determinístico","model":"none","supportsVision":false}
```

---

## 4. ARCHITECTURE & DATA FLOW

### The End-to-End Generation Pipeline

```
USER REQUEST + REFERENCES
           ↓
LOCAL INITIAL CLASSIFICATION (`classifyTask`, `resolveTargetAndSources`)
           ↓
MULTIMODAL AI DIRECTOR (`OpenAIDirector` or `GeminiDirector` via `getVisualDirector`)
           ↓
LOCAL AUTHORITY / PROVENANCE GUARD (`reconcileDirectorWithLocalRules`)
           ↓
PROMPT BUILDER (`buildPromptFromScenePlan` → `renderPromptForTargetModel`)
           ↓
LOCAL FINAL VALIDATOR (`auditPromptProvenance` strips unsupported defaults & leakage)
           ↓
OPTIONAL SECOND VISUAL AUDITOR (`GeminiAuditor` checks leakage risks)
           ↓
FINAL PROMPT + OUTPUT METADATA (`direction`, `finalPrompt`, `outputMetadata`)
```

### Hierarchy of Authority (Reconciliation Policy)
When reconciling user text, reference photos, AI suggestions, and deterministic rules, conflicts are strictly resolved in this order:
1. **Explicit User Instruction**: What the user explicitly typed in the description always wins.
2. **User-Assigned Reference Role**: The role tag chosen by the user (`PESSOA`, `PRODUTO`, etc.) cannot be reclassified by the AI Director.
3. **Target Image Structural Authority**: In edit tasks (`IDENTITY_TRANSFER`, `REPLACE_OBJECT`, `CHANGE_ENVIRONMENT`), master pose, framing, and skull orientation are locked from the target.
4. **Deterministic Local Rules**: Hardcoded safeguards against AI slop and domestic background bias.
5. **AI Director Grounded Facts**: High-confidence visual observations from reference photos.
6. **Necessary Physical Adaptations**: Anatomical hand interactions and lighting bounce.
7. **Inferences / Unsupported Defaults**: Purged by the Provenance Guard if they introduce unrequested clutter.

---

## 5. DIRECTORY STRUCTURE & KEY FILES

```
thumbnail-anti-slop/
├── .env.example                     # Reference environment variables
├── package.json                     # Scripts, Next.js 16, React 19, dependencies
├── tsconfig.json                    # TS configuration with allowImportingTsExtensions: true
├── README.md                        # High-level product summary
├── tests/
│   ├── run-tests.mjs                # 25 comprehensive test suites covering heuristics, rules & models
│   └── fixtures/
│       ├── create-sample.mjs        # Script generating minimal test PNG fixture
│       └── sample-thumbnail.png     # 640x360 test fixture image
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root HTML shell & viewport metadata
│   │   ├── page.tsx                 # Main application entry point hosting the 3 simple modes
│   │   ├── globals.css              # Tailwind imports & CSS custom properties
│   │   └── api/
│   │       ├── ai/
│   │       │   ├── status/route.ts          # GET /api/ai/status (director & auditor configuration state)
│   │       │   ├── simple-create/route.ts   # POST /api/ai/simple-create (director + local engine pipeline)
│   │       │   ├── simple-improve/route.ts  # POST /api/ai/simple-improve (prompt purification)
│   │       │   └── simple-analyze/route.ts  # POST /api/ai/simple-analyze (thumbnail slop audit)
│   │       └── youtube/status/route.ts      # Stub for optional future YouTube metadata
│   ├── components/
│   │   ├── simple/                  # Active Production UI Components
│   │   │   ├── Header.tsx           # Minimal mode switcher (CRIAR, MELHORAR, ANALISAR) & status pill
│   │   │   ├── ModeCreate.tsx       # Mode 1: Main thumbnail creation form & result display
│   │   │   ├── ModeImprove.tsx      # Mode 2: Prompt slop purifier form & diff output
│   │   │   ├── ModeAnalyze.tsx      # Mode 3: Image analyzer & surgical fix prompt generator
│   │   │   └── HistoryModal.tsx     # Client-side history browser & prompt copier
│   │   └── layout/ & modules/       # Prototype / Exploration modules (preserved for reference)
│   ├── lib/
│   │   ├── ai/                      # AI Director & Auditor Infrastructure
│   │   │   ├── types.ts             # VisualDirector, VisualAuditor, DirectorResult interfaces
│   │   │   ├── orchestrator.ts      # Director cascade, status checks, and merge policy (reconciliation)
│   │   │   ├── director/
│   │   │   │   ├── openaiDirector.ts # GPT-4o multimodal visual interpreter
│   │   │   │   └── geminiDirector.ts # Gemini multimodal visual interpreter
│   │   │   └── auditor/
│   │   │       └── geminiAuditor.ts  # Complementary visual auditor (runs on Gemini)
│   │   └── simpleEngine/            # Core Deterministic Reasoning Engine
│   │       ├── engine.ts            # The Rule Authority: intent parser, provenance guard, prompt builders
│   │       └── history.ts           # Browser localStorage persistence & target model migration
│   └── types/
│       ├── simple.ts                # Single Source of Truth for TargetModel, TARGET_MODEL_CONFIGS, catalog
│       └── index.ts                 # Legacy types for prototype modules
```

---

## 6. DOMAIN CONCEPTS & RULES

### 1. Reference Image Roles & Isolation
Users upload reference photos and assign one of the following roles:
- `PESSOA` (Person): Locks facial identity, proportions, bone structure, and true age. **Strictly forbids** copying background bedroom/furniture, clothing, or lighting from this photo into the thumbnail.
- `PRODUTO` (Product): Locks industrial geometry, button placement, screen aspect, and matte materials. Forbids copying studio lightbox reflections.
- `CENÁRIO` (Environment):
  - `MEU_AMBIENTE` mode: Preserves real physical walls, doors, windows, and layout.
  - `REFERENCIA_AMBIENTE` mode: Extracts atmospheric density, textures, and lighting mood only; geometry is not copied.
- `ESTILO` (Style): Emulates color grading, lighting temperature, and contrast only. Forbids copying faces or objects.
- `COMPOSIÇÃO` (Composition): Emulates framing and element scale hierarchy only. Forbids transferring subject identity.
- `TIPOGRAFIA` (Typography): Emulates font weight, spacing, and styling for post-production layout.
- `IMAGEM_ALVO` (Target Image): Master template for surgical edits (`IDENTITY_TRANSFER`, `REPLACE_OBJECT`, `CHANGE_ENVIRONMENT`). Sets 3D skull angle, body pose, framing, and armor/clothing.

### 2. Supported Target Image Models (2026 Catalog)
All target models are centrally configured in [`src/types/simple.ts`](file:///C:/Users/PC/.gemini/antigravity/scratch/thumbnail-anti-slop/src/types/simple.ts):

| Group | TargetModel ID | API Model ID | Prompt Style (`promptStyle`) | Key Characteristics |
|---|---|---|---|---|
| **GERAL** | `GERAL` | `none` | `neutral` | Clean, provider-agnostic photographic prompt |
| **OPENAI** | `OPENAI_GPT_IMAGE_2_5_SUNBURST` | `gpt-image-2.5-sunburst` | `structured_contract` | 10 structured sections (`GOAL:`, `CHANGE:`, `ADAPT:`, `PRESERVE:`, `AVOID:`), surgical anatomical reconstruction, 3840x2160 hint |
| **OPENAI** | `OPENAI_GPT_IMAGE_2_5_FLARE` | `gpt-image-2.5-flare` | `structured_contract` | Faster daily thumbnail generation, concise sections, 2048x1152 hint |
| **GOOGLE** | `GOOGLE_NANO_BANANA_2` | `gemini-3.1-flash-image` | `natural_multireference` | Numbered references (`Image 1`, `Image 2`), explicit `WHAT CHANGES` & `WHAT REMAINS`, 2048x1152 hint |
| **GOOGLE** | `GOOGLE_NANO_BANANA_PRO` | `gemini-3-pro-image` | `natural_multireference` | High micro-contrast, multi-reference fidelity, 3840x2160 hint |
| **MIDJOURNEY** | `MIDJOURNEY_V8_2` | `v8.2` | `concise_visual` | Concise visual prompt, strict avoidance of internal labels, appends `--ar 16:9 --v 8.2` |
| **MIDJOURNEY** | `MIDJOURNEY_NIJI_7` | `niji-7` | `concise_visual` | Illustrated/anime aesthetic, appends `--ar 16:9 --niji 7` (never uses `--style raw`) |
| **BLACK FOREST LABS** | `FLUX_2_MAX` | `flux-2-max` | `direct_natural_positive` | Direct instructions, reference sourcing, negative avoidance converted into positive attributes, 3840x2160 hint |
| **BLACK FOREST LABS** | `FLUX_2_PRO` | `flux-2-pro` | `direct_natural_positive` | Balanced latency/fidelity, 2048x1152 hint |
| **BLACK FOREST LABS** | `FLUX_2_FLEX` | `flux-2-flex` | `direct_natural_positive` | Fine typography and composition control, 2048x1152 hint |
| **BLACK FOREST LABS** | `FLUX_2_KLEIN` | `flux-2-klein` | `direct_natural_positive` | Low-latency iteration and previews, 1536x864 hint |
| **TEST** | `TEST_MODEL` | `test-model` | `neutral` | Architecture verification model for end-to-end testing |

#### Legacy Model Migration
Legacy IDs are automatically normalized to modern 2026 targets:
- `OPENAI` \u2192 `OPENAI_GPT_IMAGE_2_5_SUNBURST`
- `GEMINI`, `GOOGLE_IMAGEN` \u2192 `GOOGLE_NANO_BANANA_2`
- `MIDJOURNEY` \u2192 `MIDJOURNEY_V8_2`
- `FLUX` \u2192 `FLUX_2_MAX`

---

## 7. ENVIRONMENT VARIABLES & CONFIGURATION

The application reads configuration from environment variables defined in `.env.local` (see [`.env.example`](file:///C:/Users/PC/.gemini/antigravity/scratch/thumbnail-anti-slop/.env.example)):

```bash
# 1. AI Director Cascade (Options: auto | openai | gemini | local)
AI_DIRECTOR_PROVIDER=auto

# 2. OpenAI Multimodal Director
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
OPENAI_VISION_DETAIL=high

# 3. Gemini Visual Auditor (Complementary Auditor)
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash
ENABLE_VISUAL_AUDITOR=false
```

### Cascade Resolution Behavior
- **`auto`**: Uses OpenAI Director if `OPENAI_API_KEY` is present; if absent, falls back to Gemini Director if `GEMINI_API_KEY` is present; if neither is configured, operates via the local deterministic engine.
- **`openai`**: Requires `OPENAI_API_KEY`. If unconfigured, gracefully falls back to local engine.
- **`gemini`**: Uses `GEMINI_API_KEY`. If unconfigured, falls back to local engine.
- **`local`**: Forces 100% deterministic local execution without making network calls.
- **Auditor Independence Rule**: The Gemini Visual Auditor is **never** invoked if the primary Director is also Gemini (`orchestrator.ts` enforces non-self-auditing).

---

## 8. GUIDELINES FOR MODIFYING & EXTENDING

### Adding a New Target Model
To add a new target image model to the system:
1. **Edit `src/types/simple.ts`**:
   - Add the new model ID to `TargetModel` union.
   - Add its configuration entry to `TARGET_MODEL_CONFIGS` (specifying `displayName`, `providerGroup`, `modelId`, `promptStyle`, `aspectRatio16_9Hint`, etc.).
   - If it has shorthand names, add them to `TARGET_MODEL_ALIASES`.
   - The UI `<select>` will update **automatically** via `getSelectableTargetModels()`.
2. **Dispatching via `promptStyle`**:
   - If the new model uses an existing prompt style (`structured_contract`, `natural_multireference`, `concise_visual`, `direct_natural_positive`, or `neutral`), `renderPromptForTargetModel` in `src/lib/simpleEngine/engine.ts` will handle it without code changes.
   - If a new prompt style is required, add a handler to `renderPromptForTargetModel` and implement a dedicated adapter function.
3. **Verify with Tests**:
   - Run `npm test` to ensure all existing and new test suites pass.
   - Run `npx tsc --noEmit` and `npm run lint`.

### Invariants — Never Break These Rules
- **Never bypass the Provenance Guard**: Backgrounds from `PESSOA` references or studio setups from `PRODUTO` references must never leak into positive prompts.
- **Never face-paste**: When performing identity transfer, never generate prompts saying "swap the face", "paste face", or "put head onto". Always use anatomical reconstruction phrasing ("reconstruct facial anatomy to authentically embody identity...").
- **Never add fake ratings**: The `ANALISAR` mode must never output numerical quality scores or CTR probability estimations.
- **Never break deterministic fallback**: External AI calls must always be wrapped in `try/catch` and gracefully fall back to local engine functions.
- **Preserve Single Source of Truth**: Never duplicate `TARGET_MODEL_CONFIGS` or `normalizeTargetModel` in other files; always import or re-export from `src/types/simple.ts`.
