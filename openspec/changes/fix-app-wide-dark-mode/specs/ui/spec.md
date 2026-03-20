# UI Theme Specification

## Purpose

Ensure that all screens and components in the application support the dark mode toggle by utilizing the `useColors()` hook from the `themeStore`, and replace hardcoded light/dark colors (like `#fff`, `white`, etc.) with dynamic theme variables.

## Requirements

### Requirement: Replace Static Color Imports

The system MUST replace all direct static imports of `colors` from the `theme` directory with the dynamic `useColors()` hook from `store/themeStore`.

#### Scenario: User toggles dark mode on a screen with static imports
- GIVEN a screen that previously imported `colors` directly (e.g. `LoginScreen`, `CurrenciesScreen`)
- WHEN the user switches the app to dark mode
- THEN the screen MUST re-render and display the dark theme colors correctly
- AND the component must not have `import { colors } from '../../theme'`

### Requirement: Remove Hardcoded Hex Colors

The system MUST replace all hardcoded hex values (`#fff`, `#FFFFFF`, `white`, `#000`, etc.) used for backgrounds, texts, borders, or icons with appropriate dynamic theme variables (e.g., `themeColors.background`, `themeColors.text.primary`, `themeColors.card`).

#### Scenario: User views a component with hardcoded white backgrounds in dark mode
- GIVEN a component that previously used `backgroundColor: '#fff'`
- WHEN the user views the component in dark mode
- THEN the component MUST use the dark mode card/background color instead of stark white.

### Requirement: Update Navigation Elements

The system MUST ensure that all navigation elements, tab bars, and headers use the dynamic theme context instead of static colors.

#### Scenario: User navigates between tabs in dark mode
- GIVEN the application's root navigator or tab navigator
- WHEN the user toggles dark mode
- THEN the navigation header and tab bar backgrounds and active/inactive icons MUST reflect the dark theme colors.
