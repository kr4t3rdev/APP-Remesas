# Proposal: Replace Native Alerts with Custom Confirmation Modal

## Intent
Eliminate the dependency on React Native's `Alert.alert` entirely by creating a reusable, consistent, and themable Custom Confirmation Modal UI component for interactive confirmations (e.g., delete actions, critical resets). This will ensure the UI matches the app's design system and avoids platform-specific native alert differences.

## Proposed Approach
1. Create a new generic UI component `ConfirmModal` in `src/components/ui/`.
2. The modal will accept standard props: `visible`, `title`, `message`, `onConfirm`, `onCancel`, `confirmText`, `cancelText`, and `variant` (e.g., 'danger', 'primary').
3. Refactor all occurrences of `Alert.alert` that use multiple buttons (confirmations) to use this new modal component.
4. Manage the modal state within the screens or via a global context/store if necessary (local state per screen is preferred for simplicity unless there are too many).

## Affected Areas
- UI Components (`src/components/ui/ConfirmModal.tsx`)
- Screens with interactive alerts:
  - `ExchangeRatesScreen`
  - `TransactionsScreen`
  - Other admin or configuration screens
