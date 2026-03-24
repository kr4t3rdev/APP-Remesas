# UI Specification: Burnt Alerts

## Purpose
Standardize the application's alert system by replacing native `Alert.alert` calls with the `burnt` library to provide native iOS and Android toast notifications.

## Requirements

### Requirement: Use Burnt for Application Alerts
The system MUST replace all existing native `Alert.alert` invocations with `Burnt.toast` or `Burnt.alert` notifications (e.g., success, error, info).

#### Scenario: Displaying a Success Alert
- GIVEN an action is completed successfully (e.g., saving a transaction)
- WHEN the system attempts to notify the user
- THEN a Burnt success toast MUST be triggered using `Burnt.toast`
- AND the native `Alert.alert` MUST NOT be triggered

#### Scenario: Displaying an Error Alert
- GIVEN a process fails or an API returns an error
- WHEN the system attempts to notify the user
- THEN a Burnt error alert or toast MUST be displayed
- AND the user MUST be able to perceive the error clearly

### Requirement: Interactive Alerts (Confirmations)
Since Burnt provides mostly non-blocking toasts/alerts, interactive confirmations (where the user needs to press 'OK' or 'Cancel') MUST be handled either through native `Alert.alert` if strictly necessary for confirmations, or replaced by a custom modal/sheet if a fully custom UI is required. For this change, simple informational `Alert.alert`s will become Burnt toasts. Confirmations (with multiple buttons) MAY remain as `Alert.alert` or be converted to a custom confirmation dialog.

#### Scenario: Deleting an Item
- GIVEN the user requests to delete a sensitive item
- WHEN the system prompts for confirmation
- THEN the system MUST either retain `Alert.alert` for the confirmation dialog OR use a dedicated confirmation modal
- AND upon successful deletion, a Burnt success toast MUST be displayed.
