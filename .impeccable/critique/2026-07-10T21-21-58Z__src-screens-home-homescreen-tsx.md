---
target: dashboard principal
total_score: 17
p0_count: 0
p1_count: 2
timestamp: 2026-07-10T21-21-58Z
slug: src-screens-home-homescreen-tsx
---
# Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2/4 | Loading and pull-to-refresh exist, but failed queries are not surfaced. |
| 2 | Match System / Real World | 3/4 | Financial language is familiar; totals and conversions need clearer meaning. |
| 3 | User Control and Freedom | 1/4 | Repeated touch targets expose no effective action, undo, filter, or drill-down. |
| 4 | Consistency and Standards | 3/4 | Tokens are reused well, but hardcoded chart and symbol colors risk theme inconsistency. |
| 5 | Error Prevention | 1/4 | Data failures can look like zero or incomplete financial activity. |
| 6 | Recognition Rather Than Recall | 2/4 | Sections are labeled, but icon-only controls and hidden horizontal content weaken discoverability. |
| 7 | Flexibility and Efficiency | 1/4 | No quick actions, filters, or efficient path from overview to action. |
| 8 | Aesthetic and Minimalist Design | 2/4 | Too many equally weighted cards and sections create a component-gallery effect. |
| 9 | Error Recovery | 1/4 | Empty and failure states offer no retry or next step. |
| 10 | Help and Documentation | 1/4 | Financial calculations and dashboard semantics are unexplained. |
| **Total** | | **17/40** | **Poor — usable foundation, low decision confidence** |

# Anti-Patterns Verdict

**LLM assessment:** Moderate AI-product slop. The dashboard is structurally competent but relies on repeated card sections, uniform entrance animations, generic icon-plus-metric blocks, decorative color coding, and repeated “Ver todo” affordances. It feels more like a component gallery than a finance decision cockpit.

**Deterministic scan:** The Impeccable detector completed with exit code 0 and returned `[]`. This is not proof of native UI quality: the detector is primarily HTML/CSS/browser-oriented and did not catch React Native `StyleSheet` patterns. Source fallback caught the banned side-stripe pattern in `HomeScreen.tsx:361-368` and `HomeScreen.tsx:903-908`, plus non-functional touch targets and fixed-width horizontal cards.

**Visual overlays:** No reliable user-visible overlay exists. No mutable browser page, Expo live URL, simulator, or device screenshot surface was available, so injection was not attempted.

# Overall Impression

The dashboard has a solid mobile foundation and consistent tokens, but it does not establish what matters most. The single biggest opportunity is to reorganize it around one operational question—what the user needs to know or do now—then demote supporting information.

# What's Working

1. Safe area, pull-to-refresh, loading state, and scroll structure are appropriate native patterns (`HomeScreen.tsx:107-151`).
2. Spacing, radii, and theme primitives are centralized and applied consistently.
3. Compra, venta, utilidad, and gasto already have meaningful semantic roles, giving the redesign a useful financial vocabulary.

# Priority Issues

## [P1] No hierarchy of importance

**Why it matters:** Greeting, date, four KPIs, balances, rates, chart, objectives, and transactions all compete with similar weight. Users cannot answer “what needs my attention?” in five seconds.

**Fix:** Choose one primary operational summary, add one clear action, and group secondary modules by relevance. Move low-frequency information behind drill-down instead of stacking every module vertically.

**Suggested command:** `$impeccable layout`

## [P1] Data failures are hidden

**Why it matters:** Queries suppress thrown errors while the screen only distinguishes loading, content, and one empty transaction state. A failed request may appear as zero or incomplete financial activity, which damages trust.

**Fix:** Add explicit partial-error and full-error states, stale-data timestamps, retry actions, and per-module fallbacks. Never conflate “zero” with “unavailable.”

**Suggested command:** `$impeccable harden`

## [P2] Controls lack action and accessibility semantics

**Why it matters:** The notification control and several “Ver todo” touchables expose no effective handler or accessibility metadata. They look interactive without completing a task.

**Fix:** Wire each control to a real destination, add accessibility roles/labels/hints, and remove affordances that do nothing.

**Suggested command:** `$impeccable audit`

## [P2] Generated visual patterns weaken credibility

**Why it matters:** Side-stripe currency cards, repeated same-weight cards, and decorative color assignment look templated rather than intentional.

**Fix:** Replace the side stripe with structured currency rows or a compact balance table; reserve cards for independent interactive objects; use color only for action, status, or financial meaning.

**Suggested command:** `$impeccable distill`

## [P2] Motion is over-applied

**Why it matters:** Repeated `FadeInDown` and `ScaleIn` choreography delays a task-oriented product and reinforces the generated-dashboard feel.

**Fix:** Keep motion for refresh, state changes, and expanding details. Remove staggered page-load reveals and honor reduced-motion preferences.

**Suggested command:** `$impeccable quieter`

# Persona Red Flags

**Alex — Power User:** The primary action requires scanning and scrolling; no quick transaction entry, filter, or efficient drill-down is visible. Repeated “Ver todo” controls do not demonstrate working navigation.

**Jordan — First-Timer:** The first action is unclear, calculations such as “Balance Caja” lack explanation, and empty activity offers no guided next step.

**Sam — Accessibility-dependent user:** Icon-only controls lack semantics, compra/venta meaning relies heavily on color, and hardcoded chart/symbol colors can fail in dark mode.

# Minor Observations

- Fixed card widths (`130` and `160`) need verification across small and large devices.
- Hardcoded `#0F172A` currency symbol colors risk contrast failures on dark backgrounds.
- `AnimatedNumber` appears to animate internal state while rendering the original value.
- Several imports and values in `HomeScreen.tsx` appear unused.

# Questions to Consider

1. What is the one question this screen must answer in under five seconds?
2. Which information deserves the first viewport: today’s operational result, available cash, or exchange-rate action?
3. Should empty activity be passive information or a guided path to the next transaction?
