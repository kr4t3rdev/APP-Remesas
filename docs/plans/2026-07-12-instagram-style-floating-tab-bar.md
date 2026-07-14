# Instagram-style Floating Tab Bar Implementation Plan

## Goal

Build a floating bottom tab bar inspired by Instagram on iOS 26: content continues beneath a translucent material, the active indicator responds to touch, the bar minimizes while scrolling down, expands while scrolling up, and repeated taps return the active screen to its top.

## Current Context

- Expo SDK 54 / React Native 0.81.
- React Navigation bottom tabs 7.2.
- Five main routes: Home, Transactions, Cash, ExpenseItems, Profile.
- The current bar is absolutely positioned with 44pt horizontal insets and theme-aware translucent colors.
- `expo-blur` is declared in `package.json`, but the local installation must be verified before integrating `BlurView`.
- Native iOS 26 tabs are not the first implementation choice because the project uses `react-native-screens` 4.10 and the native navigator requires a larger migration.

## UX Contract

### Expanded state

- Height: 64pt.
- Horizontal inset: 44pt.
- Labels visible.
- All five icons visible.
- Active indicator follows the selected item.
- Content can render and scroll behind the bar.

### Minimized state

- Trigger: deliberate downward scroll after a small threshold.
- Expand trigger: upward scroll, tap on the bar, reaching the top, or changing tabs.
- Visual behavior:
  - scale the container horizontally instead of animating width;
  - reduce height from 64pt to approximately 50pt;
  - fade labels;
  - move icons toward the center;
  - preserve every touch target at a minimum of 44pt;
  - retain enough contrast against changing content.

### Press and selection behavior

- Touch down: icon scales to 0.94 over approximately 90–110ms.
- Release: icon returns with a critically damped spring.
- Tab change: active indicator translates to the destination over approximately 200–240ms.
- Releasing outside the item restores the previous visual state.
- Tapping the selected tab scrolls its root list to the top.
- If the tab contains a nested stack, a repeated tap returns to the stack root.

### Accessibility

- Respect Reduce Motion: replace spring/scale motion with a short crossfade or immediate state change.
- Respect Reduce Transparency: use a more opaque theme surface.
- Preserve tab roles, labels, selected state, and 44pt touch targets.
- Verify light mode, dark mode, Dynamic Type, and VoiceOver labels.

## Technical Design

### Components

1. `InstagramTabBar.tsx`
   - Custom React Navigation `tabBar` implementation.
   - Renders the floating material, routes, press states, indicator, and compact state.
   - Owns only presentation and navigation events.

2. `TabBarMotionProvider.tsx`
   - Stores expanded/minimized state.
   - Exposes `expand()`, `minimize()`, and `handleScroll(offset, delta, velocity)`.
   - Resets to expanded when a route changes.

3. `useTabBarScrollBehavior.ts`
   - Reusable hook for ScrollView and FlatList screens.
   - Uses hysteresis so tiny finger movements do not flicker the bar.
   - Suggested thresholds: 16pt accumulated movement and 24pt top guard.

4. `fintechTabBar.ts`
   - Retains shared dimensions and theme tokens.
   - Adds expanded/minimized metrics and motion durations.

### Animation strategy

- Use React Native `Animated` initially; no additional motion dependency is required.
- Animate only transform and opacity on the native driver where possible.
- Simulate width reduction with `scaleX` plus coordinated icon translation.
- Do not animate layout width directly.
- Use a single shared progress value (`0 = expanded`, `1 = minimized`) to prevent competing animations.

### Material strategy

- iOS: `BlurView` with a theme-aware material tint after local dependency verification.
- Android: experimental blur only where performance is acceptable; otherwise use a high-opacity tinted fallback.
- Clip the material inside the pill using `overflow: hidden`.
- Keep the border subtle and avoid combining a heavy border with a wide shadow.

### Content integration

Each primary route must expose its root scrollable ref and forward scroll events:

- `HomeScreen`
- `TransactionsScreen`
- `CashScreen`
- `ExpenseItemsScreen`
- `ProfileScreen`

The content remains under the floating bar, but every scroll container receives dynamic bottom content padding so its final interactive element can scroll completely above the bar.

## TDD Implementation Sequence

### Work Unit 1: Structural custom tab bar

1. Write tests for route rendering, active state, navigation press, dimensions, safe-area position, and light/dark tokens.
2. Implement `InstagramTabBar` without scroll minimization.
3. Replace the default generated tab bar in `MainTabs` using the `tabBar` prop.
4. Verify all five routes and current FAB offsets in the simulator.

**Acceptance:** Existing navigation behavior remains intact and no screen is blocked by the bar.

### Work Unit 2: Press and active-indicator motion

1. Write tests for press-in, press-out, canceled press, and route selection.
2. Add fixed-size touch targets and icon scale feedback.
3. Add a single animated active indicator that translates between tabs.
4. Implement Reduce Motion fallback.

**Acceptance:** Press feedback never changes layout, and indicator motion remains stable during rapid taps.

### Work Unit 3: Scroll-driven minimize/expand

1. Unit-test threshold, direction, top guard, and hysteresis as pure state transitions.
2. Implement `TabBarMotionProvider` and `useTabBarScrollBehavior`.
3. Integrate one pilot screen: Home.
4. Validate behavior on slow drag, fast flick, overscroll, and scroll-to-top.
5. Roll out to Transactions, Cash, ExpenseItems, and Profile.

**Acceptance:** Downward scrolling minimizes once; upward scrolling expands once; minor jitter does not toggle repeatedly.

### Work Unit 4: Repeated tab press and stack behavior

1. Add scroll refs and `useScrollToTop` for every root screen.
2. Verify repeated active-tab press returns content to top.
3. Preserve default `popToTop` behavior for nested stacks.
4. Expand the bar before scrolling or popping.

**Acceptance:** Repeated taps behave consistently across all five tabs.

### Work Unit 5: Material, accessibility, and hardening

1. Verify/install the Expo 54-compatible `expo-blur` package.
2. Add BlurView and Android fallback.
3. Test light/dark, Reduce Transparency, Reduce Motion, Dynamic Type, and keyboard visibility.
4. Check touch targets, contrast, orientation, smaller iPhones, iPhone 17 Pro Max, and Android compact widths.
5. Run focused tests, type checking, simulator QA, and graphify update.

**Acceptance:** No hidden controls, readable labels, stable 60fps-feeling transforms, and graceful fallback without blur.

## Test Matrix

| Scenario | Expected result |
|---|---|
| Tap inactive tab | Route changes and indicator moves |
| Press and cancel | Icon returns without navigation |
| Rapid tab taps | Latest selected route wins; no stuck animation |
| Scroll down | Bar minimizes after threshold |
| Scroll up | Bar expands after threshold |
| Scroll near top | Bar stays expanded |
| Tap active tab | Root content scrolls to top |
| Open keyboard | Bar hides and returns expanded |
| Reduce Motion | No scale/spring motion |
| Light/dark mode | Material and contrast update immediately |
| Final list item | Can scroll fully above the bar |

## Risks and Controls

- **Scroll-handler conflicts:** merge handlers instead of replacing existing callbacks.
- **Animation jitter:** use hysteresis and one shared progress value.
- **Blur performance on Android:** feature-detect and fall back to tinted opacity.
- **Concurrent repository changes:** restrict edits to navigation and the five root tab screens; never stage unrelated files.
- **Large review surface:** commit by work unit with its tests, not by file type.

## Planned Work-unit Commits

1. `feat(navigation): add custom floating tab bar shell`
2. `feat(navigation): animate tab press and selection indicator`
3. `feat(navigation): minimize tab bar on scroll`
4. `feat(navigation): restore active tabs to top on repeat press`
5. `feat(navigation): add adaptive blur and accessibility fallbacks`

## Definition of Done

- All five tabs use the shared custom bar.
- The bar expands/minimizes predictably from scroll direction.
- Press and selection animations remain smooth during rapid input.
- Active-tab repeat press returns the screen to top.
- The final interactive element on every screen can scroll above the bar.
- Light, dark, Reduce Motion, and no-blur fallback are verified.
- Focused unit/integration tests pass.
- Simulator QA passes on at least one compact and one large iPhone.
- Graphify is updated.
