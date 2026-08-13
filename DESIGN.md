# Web Design System

<!-- impeccable:design-schema 1 -->

## Direction

**Station of the bank teller.** Cashflow web is a working station, not a marketing page: a stable rail, aligned figures, visible operating state, and a clear ticket-like reading order. The admin view is denser; the operator view breathes more. Both remain unmistakably the same product.

## Modes

- **Operator**: modern, confident fintech. Spacious content, calm surfaces, prominent balances, restrained motion.
- **Admin**: operations console. Compact KPI strip, tabular figures, audit/event rows, explicit partial-data states.

## Palette

The six persisted themes remain authoritative: `ocean`, `emerald`, `midnight`, `vault`, `gold`, `garnet`, each with light and dark variants. Do not replace their semantic roles. Web composition uses theme tokens for surfaces, text, borders, financial states, and accents.

Web-specific rules:

- Accent color is used for action and active state, not decoration everywhere.
- Warnings and negative financial states remain explicit and never rely on color alone.
- Admin surfaces prefer `colors.border` and compact contrast over large gradients.
- Selection, focus, and tabular numerals should inherit the active theme.

## Composition

- Desktop navigation is a fixed left rail; content owns the remaining width.
- User desktop content is centered with a `1440px` maximum and generous horizontal margins.
- Admin desktop uses a compact horizontal KPI strip and panel rhythm rather than a hero-only stack.
- Forms use an operational ticket order: identity, credentials, action, recovery.
- Mobile keeps the existing native composition and floating tab bar.

## Type

- Existing React Native typography remains the cross-platform baseline.
- Operational values use `fontVariant: ["tabular-nums"]` where supported.
- Admin metadata uses uppercase, tracked labels sparingly for status and column context.
- Spanish product copy remains direct and specific.

## Motion

Existing fade/scale entrances remain, but web surfaces should avoid native-driver assumptions. The authored moment is the station boot: status line, rail, and primary panel settle into place once. Content must remain visible without animation.

## States

Every dashboard surface must expose loading, partial data, empty, error, refresh, hover/focus, and disabled states. Partial data is not hidden behind a generic error.

## Accessibility and browser finish

- Keep real buttons, labels, roles, and keyboard focus.
- Use `boxShadow` on web instead of deprecated `shadow*` props.
- Use `style.pointerEvents` rather than component props on web.
- Preserve responsive behavior at desktop, tablet, and mobile widths.

## Direction Contract

THESIS: Cashflow is a working FX station where every figure has a place and every state is visible.
OWN-WORLD: Six themeable surfaces, a left operational rail, tabular financial figures, ticket-like status rows, and compact console metadata.
STORY: An operator signs in, sees the state of the desk, and moves from balance to action without hunting through decorative cards.
FIRST VIEWPORT: Login shows a branded station panel and a focused credential ticket; authenticated desktop shows the rail beside the active work surface.
FORM: Station of the bank teller, assigned direction 6, seed `22c31130`.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
