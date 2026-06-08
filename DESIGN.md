# Design Guidelines — InterviewLens

## Color Palette
- **Primary** — Subdued navy: `#1E2D45` (backgrounds, headers, nav)
- **Secondary** — Slate: `#4A5568` (body text, secondary labels)
- **Accent** — Warm amber: `#F6A623` (CTAs, highlights, active states)
- **Surface** — Off-white / light gray: `#F7F8FA` (card backgrounds, page bg)
- **Border** — `#E2E8F0`
- **Error / Alert** — Muted red: `#E53E3E`
- **Success** — `#38A169`

## Typography
- **Display / Headings** — Inter, semibold/bold, tight tracking
- **Body** — Inter, regular, 16px base, 1.6 line height
- **Mono / Labels** — JetBrains Mono for timestamps, speaker labels, and data readouts
- Scale: 12 / 14 / 16 / 20 / 24 / 32 / 48px

## Elevation & Shadows
- Cards: subtle box-shadow `0 1px 4px rgba(0,0,0,0.08)`
- Modals / drawers: `0 8px 32px rgba(0,0,0,0.16)`
- No heavy drop shadows — editorial, flat-leaning aesthetic

## Layout
- Max content width: 1200px, centered
- 8px base grid
- Generous whitespace; data-dense sections use consistent 16/24px gutters
- Sidebar navigation (desktop), bottom tab bar (mobile)

## Components
- **Buttons** — Rounded corners (6px), amber fill for primary, navy outline for secondary
- **Cards** — White background, 1px border, 8px radius, subtle shadow
- **Charts** — Clean line/area charts for sentiment arc; horizontal bar for talk-time; minimal gridlines
- **Upload zone** — Dashed amber border on hover, drag-and-drop with icon
- **Tags / Badges** — Pill shape, slate bg, small mono text for topics and speaker labels
- **Progress indicators** — Linear progress bar in amber for analysis pipeline steps

## Motion
- Subtle transitions (150–200ms ease-out) for hover states, modals, and tab switches
- No gratuitous animation — data loads with fade-in, not slide effects

## Accessibility
- WCAG AA contrast minimum throughout
- Focus rings visible on all interactive elements
- Screen-reader labels on all chart and icon elements