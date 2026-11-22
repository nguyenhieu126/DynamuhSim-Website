---
name: Autonomous Mecanum Robotics Console
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#424754'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#0059c7'
  primary: '#0051b6'
  on-primary: '#ffffff'
  primary-container: '#1769e0'
  on-primary-container: '#f0f2ff'
  inverse-primary: '#afc6ff'
  secondary: '#006874'
  on-secondary: '#ffffff'
  secondary-container: '#56eaff'
  on-secondary-container: '#006773'
  tertiary: '#4e566c'
  on-tertiary: '#ffffff'
  tertiary-container: '#666e85'
  on-tertiary-container: '#f0f2ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#afc6ff'
  on-primary-fixed: '#001a43'
  on-primary-fixed-variant: '#004398'
  secondary-fixed: '#97f0ff'
  secondary-fixed-dim: '#3dd9ed'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.5rem
  space-sm: 1rem
  space-md: 1.5rem
  space-lg: 2rem
  space-xl: 3rem
---

## Brand & Style

The design system serves mission-critical robotics operations, hardware telemetry, and real-time control for autonomous Mecanum-wheel mobile platforms operating on ROS 2 Jazzy. The audience includes robotics engineers, autonomy researchers, and field operations technicians who require absolute legibility, zero ambiguity during high-frequency data streams, and rapid cognitive triage under operational stress.

The visual style blends **Corporate Modern** with **Technical Precision**:
- **Utilitarian Clarity**: Crisp, light-mode operational canvas paired with a deep command-rail sidebar for situational control.
- **Instrument-Grade Hierarchy**: Structural delineation through fine boundaries, subdued elevations, and functional status colors rather than decorative flourishes.
- **Robotics Operational Trust**: Uncompromising visual feedback for states such as Emergency Stop, degradation, network ping jitter, and motor driver telemetry.

## Colors

The palette is engineered for high visual contrast and critical diagnostic feedback across complex ROS 2 sensor pipelines.

- **Primary (`#1769E0`)**: Robotics industrial blue. Used for primary execution actions, active node indicators, active route vectors, and focal controls.
- **Secondary (`#00C2D6`)**: Cyan telemetry accent. Reserved for LiDAR scan point highlights, depth map contours, Odometry vector paths, and real-time data streaming accents.
- **Tertiary (`#0F172A`)**: Deep Navy / Slate-900. Utilized exclusively for the primary persistent navigation sidebar, operational command docks, and high-contrast terminal headers.
- **Neutral (`#64748B`)**: Structural slate gray. Governs secondary metric labels, inactive states, micro-borders (`#E2E8F0`), and structural divider lines.
- **Semantic States**:
  - **Emergency Stop / Critical Error**: `#EF4444` (Pure safety alert red).
  - **Warning / Degraded QoS / Dropped Packets**: `#F59E0B` (Amber alert).
  - **Connected / Healthy Node / Nominal RTPS**: `#10B981` (Emerald green).
  - **Simulation / Mock Environment**: `#8B5CF6` (Purple tag).

## Typography

The typographic hierarchy implements a bifurcated dual-engine model:

1. **System & Interaction Layer (`Inter`)**: All structural headlines, modal dialogs, status badges, and interaction triggers use Inter for instantaneous scanning and frictionless task switching.
2. **Telemetry, Topics, & Metrics Layer (`JetBrains Mono`)**: Monospaced precision is strictly enforced across all numeric measurements, orientation degrees, wheel encoder RPM values, ROS 2 `/topic` strings, QoS latency counters, and coordinate tuples `(x, y, z, w)`. Tabular figures prevent layout jumping during 60Hz sensor refresh rates.

## Layout & Spacing

The system leverages a desktop-first fluid grid optimized for an operational baseline width of 1440px, scaling cleanly down to 1024px tablet field units and upward to ultra-wide operations screens.

- **Grid Architecture**: 12-column modular grid with standard `1.5rem` (24px) gutters on desktop and `1rem` (16px) gutters on mobile/tablet viewports.
- **Rhythm**: Strict 8px baseline rhythm (`0.5rem`, `1rem`, `1.5rem`, `2rem`, `3rem`). Spacing must remain mathematically predictable across dense telemetry grids.
- **Adaptive Breakpoints**:
  - `Desktop Ultra (>1440px)`: Fixed navigation command rail (280px), multi-column sensor visualizer panes (LiDAR, RGB-D, odometry matrix) side-by-side with telemetry cards.
  - `Desktop Compact (1024px - 1439px)`: Collapsed mini-sidebar (72px), visualizers stack to 2-column modules.
  - `Tablet / Field Touchscreen (<1024px)`: Single-column priority cards with swipeable sensor canvas tabs and enlarged touch targets for emergency controls.

## Elevation & Depth

Visual hierarchy uses crisp, low-contrast structural borders backed by ambient light diffusion:

- **Canvas (`#F8FAFC`)**: Flat neutral backdrop providing maximum contrast against white telemetry cards and color-coded telemetry monitors.
- **Card Surface (`#FFFFFF`)**: Pure white cards bounded by a single-pixel hairline border (`1px solid #E2E8F0`).
- **Elevation Levels**:
  - **Level 0 (Flat/Sub-cards)**: `border: 1px solid #E2E8F0`, no shadow. Used for embedded sensor data cells inside cards.
  - **Level 1 (Standard Card)**: `box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)`. Standard dashboard telemetry containers.
  - **Level 2 (Hover/Focus / Active Telemetry Deck)**: `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`. Active interactive visualizers and hovered nodes.
  - **Level 3 (Modals / Emergency Overlays / Floating Joysticks)**: `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.08)`.

## Shapes

The roundedness token is set to `2` (Moderate Rounded):
- **Base Cards & Canvases**: Radius is strictly standardized to `0.75rem` (12px) or `1rem` (16px) for large sensor visualization frames, maintaining an industrial yet modern feel.
- **Controls & Buttons**: Standard interactive elements utilize `0.5rem` (8px).
- **Status Tags & Metric Badges**: `0.375rem` (6px) or fully pill-shaped (`9999px`) for high-level connectivity indicators.
- **Viewport Frames**: LiDAR and Camera containers feature clipped `0.75rem` corners with recessed inset borders to emphasize screen-within-screen diagnostics.

## Components

### 1. Buttons & Emergency Stop (E-Stop)
- **Primary Control**: Background `#1769E0`, foreground `#FFFFFF`, border-radius 8px. Hover: `#1256B8`. Active: `#0D4494`. Focus ring: 2px solid `#00C2D6` offset by 2px.
- **Critical E-Stop Button**: Fixed prominent anchor or prominent visual container. Background `#EF4444`, uppercase `Inter` bold font, border: 2px solid `#DC2626`. Pulsing ambient ring during active emergency lock.
- **Secondary Action**: Border `1px solid #CBD5E1`, background `#FFFFFF`, text `#0F172A`. Hover: background `#F1F5F9`.

### 2. Status Chips & Badges
- **Connected (Nominal)**: Background `#ECFDF5`, text `#065F46`, dot indicator `#10B981`.
- **Degraded (High Jitter / Weak QoS)**: Background `#FFFBEB`, text `#92400E`, dot indicator `#F59E0B`.
- **Disconnected / Stale Topic**: Background `#FEF2F2`, text `#991B1B`, dot indicator `#EF4444`.
- **Simulation Mode**: Background `#F5F3FF`, text `#5B21B6`, dot indicator `#8B5CF6`.

### 3. Telemetry & Sensor Cards
- Structural white cards (`#FFFFFF`) with a top diagnostic strip displaying ROS 2 topic names in `JetBrains Mono` (`label-sm`).
- Metric value rendered in high-contrast monospaced font with embedded units (`rpm`, `m/s`, `rad/s`, `°C`, `V`).

### 4. Omnidirectional Mecanum Wheel Vector Widget
- 4-wheel telemetry module showing front-left, front-right, rear-left, and rear-right individual RPMs, slip-detection indicators, and resultant $V_x$, $V_y$, and $\omega_z$ vectors.
- Color accent: `#00C2D6` for directional arrows and dynamic velocity magnitude.

### 5. Sensor Visualization Frames (LiDAR & Camera)
- Dark-themed inset canvas (`#090D16`) surrounded by the standard `#E2E8F0` card frame.
- High-contrast HUD overlays displaying FPS, latency (ms), point cloud count, and dynamic grid coordinates in `JetBrains Mono` (`11px`).