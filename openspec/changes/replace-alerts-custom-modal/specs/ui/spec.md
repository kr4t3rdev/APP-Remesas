# Delta for UI: Custom Confirmation Modal

## ADDED Requirements

### Requirement: Custom Confirmation Component
The system MUST provide a custom, themable UI component for user confirmations, replacing the native `Alert.alert` dialogs.

#### Scenario: Displaying a Destructive Confirmation
- GIVEN a user triggers a destructive action (e.g., deleting a rate)
- WHEN the system needs confirmation
- THEN the system MUST display the custom `ConfirmModal`
- AND the modal MUST show a title, message, a "Cancel" button, and a visually distinct "Delete/Confirm" button (e.g., red color for danger).

#### Scenario: Confirming an Action
- GIVEN the confirmation modal is open
- WHEN the user presses the confirm button
- THEN the `onConfirm` callback MUST execute
- AND the modal MUST close.

#### Scenario: Canceling an Action
- GIVEN the confirmation modal is open
- WHEN the user presses the cancel button or taps outside the modal (if allowed)
- THEN the `onCancel` callback MUST execute
- AND the modal MUST close without performing the action.

## MODIFIED Requirements

### Requirement: Interactive Alerts Handling
(Previously: The system used `Alert.alert` with a `buttons` array for confirmations).
The system MUST now use the custom `ConfirmModal` component for all interactive confirmations instead of `Alert.alert`.
