# Proposal: Replace React Native Alerts with Burnt Toasts/Alerts

## Intent
Replace all native `Alert.alert` usages in the application with the `burnt` library to provide a more modern, native-feeling, and visually appealing toast/alert UI experience across iOS and Android.

## Proposed Approach
1. Install and configure the `burnt` library in the React Native/Expo project.
2. Identify all 27 files currently using `Alert.alert`.
3. Create a unified utility or service to trigger Burnt alerts/toasts instead of native alerts.
4. Refactor all occurrences of `Alert.alert` to use the new Burnt implementation.

## Affected Areas
- UI/UX (Alerts, Toasts, Confirmations)
- `src/screens/*`
- `src/components/*`
- `src/modules/*`
