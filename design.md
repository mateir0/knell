---
version: alpha
name: Knell
description: |
  Knell's design system is a quiet funeral rendered in a maximalist type
  system. It takes the spacedesk structural grammar — one bold claim per
  screen, oversized uppercase display typography, achromatic surfaces with a
  single hot accent, elevation by color-blocking rather than shadow — and
  re-casts it in bell bronze, bone, and near-black. The scale shouts; the
  palette whispers. The mood is confident, still, and final: a bell, bronze,
  bone, and space. No gothic clichés, no horror imagery, no decoration that
  does not carry a verdict.
source:
  inspiredBy: "https://spacedesk.net"
  referenceFile: "references/spacedesk-design.md"
  createdAt: 2026-10-20
  tokensMeasured: false
colors:
  canvas: "#0A0A0B"
  surface: "#141416"
  surface-raised: "#1C1C1F"
  ink: "#EDEDED"
  body: "#B9B9BC"
  muted: "#828282"
  faint: "#26262A"
  accent: "#C9A24B"
  accent-bright: "#E3C878"
  on-accent: "#0A0A0B"
  link: "#D9B45C"
  dead: "#E5484D"
  alive: "#3FA46A"
typography:
  display-xxl:
    fontFamily: "Archivo"
    fontSize: 200px
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: 0px
    textTransform: uppercase
  display-xl:
    fontFamily: "Archivo"
    fontSize: 80px
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: 0px
    textTransform: uppercase
  display-lg:
    fontFamily: "Archivo"
    fontSize: 42px
    fontWeight: 900
    lineHeight: 1
    letterSpacing: 0px
    textTransform: uppercase
  heading:
    fontFamily: "Archivo"
    fontSize: 38px
    fontWeight: 800
    lineHeight: 1
    letterSpacing: 0px
    textTransform: uppercase
  stamp:
    fontFamily: "Archivo"
    fontSize: 20px
    fontWeight: 900
    lineHeight: 1
    letterSpacing: 2px
    textTransform: uppercase
  body-xl:
    fontFamily: "Archivo"
    fontSize: 26px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: 0px
    textTransform: uppercase
  body-lg:
    fontFamily: "Archivo"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0px
  body-md:
    fontFamily: "Archivo"
    fontSize: 17px
    fontWeight: 400
    letterSpacing: 0px
  body-sm:
    fontFamily: "Archivo"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0px
  body-xs:
    fontFamily: "Archivo"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0px
  button:
    fontFamily: "Archivo"
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0px
    textTransform: uppercase
  caption-sm:
    fontFamily: "Archivo"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: 1px
    textTransform: uppercase
  caption-xs:
    fontFamily: "Archivo"
    fontSize: 9px
    fontWeight: 400
    letterSpacing: 1px
    textTransform: uppercase
rounded:
  none: 0px
  xs: 16px
  full: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 28px
  xxxl: 32px
  section: 36px
  band: 40px
borderWidths:
  thin: 1px
  stamp: 2px
elevationStrategy: color-blocking
themes:
  dark:
    bg: "#0A0A0B"
    surface: "#141416"
    surfaceRaised: "#1C1C1F"
    text: "#EDEDED"
    textBody: "#B9B9BC"
    textMuted: "#828282"
    border: "#26262A"
    accent: "#C9A24B"
    accentFg: "#0A0A0B"
    focusRing: "#C9A24B"
    dead: "#E5484D"
    alive: "#3FA46A"
    elevation: "border+surface"
gradients:
  - context: hero
    kind: radial
    value: "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(201, 162, 75, 0.14) 0%, rgba(201, 162, 75, 0.04) 45%, rgba(10, 10, 11, 0) 75%)"
  - context: section-fade
    kind: linear
    value: "linear-gradient(180deg, #0A0A0B 0%, #141416 100%)"
components:
  button-filled:
    typography: "{typography.button}"
    textColor: "{colors.on-accent}"
    height: 41px
    padding: "12px 45px 12px 45px"
    rounded: "{rounded.xs}"
    backgroundColor: "{colors.accent}"
  button-ghost:
    typography: "{typography.button}"
    textColor: "{colors.ink}"
    height: 41px
    padding: "12px 45px 12px 45px"
    rounded: "{rounded.xs}"
    border: "1px solid {colors.faint}"
    backgroundColor: "transparent"
  tombstone-card:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.faint}"
    rounded: "{rounded.none}"
    padding: "24px"
    nameTypography: "{typography.heading}"
    killerTypography: "{typography.body-sm}"
    metaTypography: "{typography.caption-sm}"
    metaColor: "{colors.muted}"
  verdict-stamp-dead:
    typography: "{typography.stamp}"
    textColor: "{colors.dead}"
    border: "2px solid {colors.dead}"
    padding: "6px 14px"
    rounded: "{rounded.none}"
    transform: "rotate(-4deg)"
  verdict-stamp-alive:
    typography: "{typography.stamp}"
    textColor: "{colors.alive}"
    border: "2px solid {colors.alive}"
    padding: "6px 14px"
    rounded: "{rounded.none}"
    transform: "rotate(-4deg)"
  verdict-stamp-zombie:
    typography: "{typography.stamp}"
    textColor: "{colors.accent}"
    border: "2px solid {colors.accent}"
    padding: "6px 14px"
    rounded: "{rounded.none}"
    transform: "rotate(-4deg)"
  badge-unchecked:
    typography: "{typography.caption-sm}"
    textColor: "{colors.muted}"
    border: "1px solid {colors.faint}"
    height: 30px
    padding: "7px 10px"
    rounded: "{rounded.xs}"
  input:
    typography: "{typography.body-md}"
    textColor: "{colors.ink}"
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.faint}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
    placeholderColor: "{colors.muted}"
  link:
    typography: "{typography.body-sm}"
    textColor: "{colors.link}"
  nav:
    backgroundColor: "transparent"
    typography: "{typography.caption-sm}"
    textColor: "{colors.ink}"
  autopsy-player:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.faint}"
    rounded: "{rounded.none}"
    padding: "20px 24px"
    typography: "{typography.body-sm}"
states:
  button-hover:
    target: button-filled
    state: hover
    backgroundColor: "{colors.accent-bright}"
  button-ghost-hover:
    target: button-ghost
    state: hover
    borderColor: "{colors.accent}"
    textColor: "{colors.accent}"
  button-focus-visible:
    target: button
    state: focus-visible
    outline: "3px solid {colors.accent}"
  link-hover:
    target: link
    state: hover
    textDecoration: underline
  input-focus:
    target: input
    state: focus
    borderColor: "{colors.accent}"
    boxShadow: "rgba(201, 162, 75, 0.25) 0px 0px 0px 1px inset"
  tombstone-hover:
    target: tombstone-card
    state: hover
    backgroundColor: "{colors.surface-raised}"
  nav-hover:
    target: nav
    state: hover
    opacity: 0.6
breakpoints:
  - width: 375
    containerWidth: 345
    gridColumns: 1
    headingPx: 72
    bodyPx: 16
    sectionPaddingX: 15
  - width: 768
    containerWidth: 738
    gridColumns: 1
    headingPx: 96
    bodyPx: 16
    sectionPaddingX: 15
  - width: 1024
    containerWidth: 994
    gridColumns: 2
    headingPx: 120
    bodyPx: 16
    sectionPaddingX: 15
  - width: 1280
    containerWidth: 1240
    gridColumns: 2
    headingPx: 160
    bodyPx: 16
    sectionPaddingX: 20
  - width: 1440
    containerWidth: 1300
    gridColumns: 3
    headingPx: 200
    bodyPx: 16
    sectionPaddingX: 0
coverage:
  statesFound: 7
  gradientsFound: 2
  darkOnly: true
  semanticRampDeclared: true
---

# Knell Design System

## 1. Visual Theme & Atmosphere

Knell is a quiet funeral rendered in a maximalist type system. The structural grammar comes from spacedesk: one bold claim per screen, oversized uppercase display typography, achromatic surfaces, a single hot accent, and elevation achieved by color-blocking instead of shadows. The identity is Knell's own: where spacedesk is neon, loud, and alive, Knell is bronze, bone, and near-black — the same confidence at a lower volume.

**Key Characteristics**
- Dark only. There is no light theme; a funeral does not have a light mode
- Display type at up to 200px, uppercase, tight leading (0.9–1.0) — size is the hierarchy
- One accent: bell bronze (`{colors.accent}` — `#C9A24B`), because bells are cast in bronze
- Verdict colors (`{colors.dead}`, `{colors.alive}`) are functional signals, never decoration
- Sharp geometry; the only radius in the system is 16px, reserved for buttons and badges
- Depth from surface shifts (`canvas` → `surface` → `surface-raised`) and 1px borders, never drop shadows
- Imagery is limited to a single bell motif; no gothic type, no skulls, no horror clichés

## 2. Color Palette & Roles

### Brand
- **Bell Bronze** (`{colors.accent}` — `#C9A24B`): The single accent. Primary buttons, the focus ring, the zombie-gap stamp, key highlights. Used sparingly — bronze is precious, not wallpaper
- **Bronze Bright** (`{colors.accent-bright}` — `#E3C878`): Hover state for filled buttons only
- **On Accent** (`{colors.on-accent}` — `#0A0A0B`): Text on bronze surfaces

### Surfaces & Ink
- **Canvas** (`{colors.canvas}` — `#0A0A0B`): Page background; near-black with warmth removed
- **Surface** (`{colors.surface}` — `#141416`): Cards, inputs, the autopsy player
- **Surface Raised** (`{colors.surface-raised}` — `#1C1C1F`): Hover state of cards; raised panels
- **Bone** (`{colors.ink}` — `#EDEDED`): Headings and high-priority text
- **Body** (`{colors.body}` — `#B9B9BC`): Running text
- **Muted** (`{colors.muted}` — `#828282`): Captions, metadata, the UNCHECKED badge
- **Faint** (`{colors.faint}` — `#26262A`): All 1px borders and dividers

### Functional (verdicts only)
- **Dead** (`{colors.dead}` — `#E5484D`): The DEAD stamp, cause-of-death markers. Never used for branding, links, or decoration
- **Alive** (`{colors.alive}` — `#3FA46A`): The ALIVE stamp and survivor markers only

### Interactive
- **Link** (`{colors.link}` — `#D9B45C`): A lighter bronze for text links (receipts, evidence); underline on hover

## 3. Typography Rules

### Font Family

**Archivo** (all roles) — a free neo-grotesque with the same punch as spacedesk's licensed N27, which is not ours to use.
- Display roles: weight 900, uppercase
- Headings: weight 800–900, uppercase
- Body roles: weight 400; emphasis at 700
- Fallback stack: `Archivo, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- Display fallback if Archivo's 900 is unavailable: **Anton**

### Hierarchy

| Role | Size | Weight | Line Height | Notes |
|---|---|---|---|---|
| Display XXL | 200px | 900 | 0.95 | Uppercase; hero word "KNELL" / "THE BELL TOLLS" (fluid: clamp to 72px at 375px wide) |
| Display XL | 80px | 900 | 0.9 | Uppercase; screen claims ("WE SWEEP THE INTERNET") |
| Display LG | 42px | 900 | 1.0 | Uppercase; section headings |
| Heading | 38px | 800 | 1.0 | Uppercase; tombstone names, card titles |
| Stamp | 20px | 900 | 1.0 | Uppercase, 2px tracking; verdict stamps, rotated −4° |
| Body XL | 26px | 700 | 1.1 | Uppercase; large statements |
| Body LG | 22px | 700 | 1.2 | Emphasis body |
| Body MD | 17px | 400 | — | Default body / input text |
| Body SM | 16px | 400 | 1.5 | Card body, evidence notes |
| Body XS | 15px | 400 | 1.5 | Loose body text |
| Button | 14px | 700 | 1.0 | Uppercase; action labels |
| Caption SM | 12px | 400 | 1.0 | Uppercase, 1px tracking; metadata, killer lines |
| Caption XS | 9px | 400 | — | Uppercase, 1px tracking; fine print, attribution |

### Principles

- **Scale as hierarchy**: if it matters more, it is bigger — not bolder, not brighter
- **Uppercase dominates**: display, headings, stamps, buttons, captions are uppercase; sentence case is reserved for running body copy and evidence quotes
- **Tight leading on display** (0.9–1.0); **generous leading on body** (1.5)
- **Tracking**: 0px on display; 1px on captions; 2px on stamps so they read as struck marks, not text

## 4. Component Stylings

### Buttons
- **Filled**: bronze background, near-black text, 41px height, padding 12px 45px, radius 16px, uppercase 14px/700. Hover: bronze brightens. This is the "Ring the bell" button — there is one per screen, maximum
- **Ghost**: transparent, 1px faint border, bone text. Hover: border and text turn bronze

### Tombstone Card (the graveyard unit)
- Surface background, 1px faint border, **radius 0** — tombstones are not rounded
- The dead idea's name in Heading (38px, uppercase), the killer in Caption SM muted ("KILLED BY SNAPPSELL"), cause of death in Body SM, date in Caption XS
- Hover: background lifts to surface-raised. No shadow, ever
- The verdict stamp sits top-right, rotated −4°

### Verdict Stamps
- 2px border, Stamp typography (20px/900, 2px tracking), padding 6px 14px, rotated −4°, transparent background
- DEAD → `{colors.dead}`; ALIVE → `{colors.alive}`; ZOMBIE GAP → bronze
- A stamp is a mark struck onto the card, not a pill badge — never filled, never rounded

### Inputs
- Surface background, 1px faint border, radius 0, 17px text, muted placeholder
- Focus: border turns bronze with a 1px inset bronze glow

### Badges
- **UNCHECKED**: 1px faint border, muted caption text, radius 16px — the honest badge a candidate wears until the sweep decides

### Autopsy Player
- Surface panel, radius 0, with a bronze play control and the run's toll count ("8 IDEAS · 6 DEAD · 1 ZOMBIE · 1 ALIVE") in Caption SM

## 5. Layout & Screens

- **One claim per screen** on the landing; sections are separated by surface shifts (section-fade gradient) and space, not lines or shadows
- Landing screens, in order: (1) KNELL hero with the bronze radial glow; (2) BRING A THEME. OR BRING YOURSELF.; (3) WE SWEEP THE INTERNET.; (4) THE BELL TOLLS, OR IT DOESN'T.; (5) THE GRAVEYARD SO FAR. (tombstone grid)
- Max container 1300px at desktop; aggressive whitespace (section padding ≥ 36px vertical rhythm from the spacing scale)
- Product screens (intake, run, verdicts) use the same tokens at reading sizes: Display LG for the screen title, no XXL type inside the tool

## 6. Motion

Motion language is borrowed from award-winning scroll sites (GSAP), and it lives **on the landing page only**:
- Hero: "THE BELL TOLLS" reveals word by word with a slight 3D rotation (GSAP + ScrollTrigger)
- Sections fade/pin per claim as the user scrolls; exactly ONE clip-path transition, into the graveyard section
- The bell motif swings once, subtly, when a verdict stamp lands during a live run — and nowhere else
- **Product surfaces have no scroll-jacking and no reveal delays.** A verdict appears the moment it is decided; the drama is the agent's work, not the chrome
- Respect `prefers-reduced-motion`: all reveals become instant

## 7. Do's and Don'ts

- **Do** let type size carry hierarchy; **don't** add colors to create emphasis
- **Do** keep bronze rare — one filled button and a few marks per screen; **don't** use bronze for body text or large fills
- **Do** use red and green only where a verdict exists; **don't** use them for errors, links, or decoration (form errors use bone text + bronze border, not red)
- **Do** keep corners sharp on cards, inputs, and panels; **don't** round anything except buttons and badges
- **Do** show the receipt link with every verdict; **don't** render a verdict without evidence
- **Don't** use drop shadows, glassmorphism, gothic fonts, skull imagery, or the color green as a brand accent (that identity belongs to the reference, not to Knell)
