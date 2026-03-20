# Proposal: Fix Services Dark Mode

## Intent
The Services screens (AdminServicesScreen, AdminPlansListScreen, AdminPlanCreateScreen, AdminLicensesListScreen, AdminLicenseDetailScreen) are not displaying dark mode correctly despite recent updates. The goal is to identify and resolve the thematic inconsistencies so that all components respect the system's or app's dark mode settings properly.

## Scope
- Refactor how the `useThemeStore` and `useColors` hooks are consumed in the Services flow.
- Ensure all hardcoded light/dark colors are replaced with the centralized theme tokens.
- Ensure the header, backgrounds, texts, inputs, and cards adapt seamlessly without hardcoded hex values.

## Affected Areas
- `src/screens/admin/AdminServicesScreen.tsx`
- `src/screens/admin/plans/AdminPlansListScreen.tsx`
- `src/screens/admin/plans/AdminPlanCreateScreen.tsx`
- `src/screens/admin/licenses/AdminLicensesListScreen.tsx`
- `src/screens/admin/licenses/AdminLicenseDetailScreen.tsx`
- Related UI components (`GradientCard`, `InfoCard`, `ActionTile`, etc.)