# UI Specification

## ADDED Requirements

### Requirement: Centralized Theme Consumption
The system MUST consume theme variables exclusively from `useColors()` and `useIsDark()` provided by `src/store/themeStore.ts` instead of relying on `useColorScheme()` from React Native or hardcoded ternary hex values (`isDark ? '#0f172a' : '#fff'`).

#### Scenario: Switching Themes
- GIVEN the app is running in the Services flow
- WHEN the user toggles the global theme state (via `useThemeStore`)
- THEN all screens and components in the Services flow MUST immediately update their backgrounds, texts, and borders to the new theme colors without requiring a reload.

## MODIFIED Requirements

### Requirement: Dark Mode Styles in Services Screens
The screens in the Services flow MUST use the structured colors from `colors.background`, `colors.card`, `colors.text.primary`, `colors.text.secondary`, etc. (Previously: using hardcoded hex values with a ternary based on `useColorScheme`).

#### Scenario: Displaying Admin Services Screen in Dark Mode
- GIVEN the app is set to dark mode
- WHEN the user navigates to the Admin Services Screen
- THEN the background MUST be `colors.background` and the text MUST be `colors.text.primary`.

#### Scenario: Displaying Cards in Dark Mode
- GIVEN the app is set to dark mode
- WHEN the user views `GradientCard`, `InfoCard`, or `ActionTile`
- THEN the background of these cards MUST use `colors.card` or appropriate dark mode semantic colors instead of hardcoded hex values.

## REMOVED Requirements
None.