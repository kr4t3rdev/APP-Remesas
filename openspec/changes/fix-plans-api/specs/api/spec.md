# Plan API Specification

## MODIFIED Requirements

### Requirement: Fetch Plans
The system MUST fetch plans using the `/subscriptions/plans` endpoint, and fall back to `/plans` if the first endpoint fails.

#### Scenario: Backend uses subscriptions prefix
- GIVEN the backend API is running with the `/subscriptions/plans` endpoint active
- WHEN the user views the Plans List screen
- THEN the system MUST successfully fetch and map the plans to the UI.

#### Scenario: Backend uses legacy prefix
- GIVEN the backend API is running with the `/plans` endpoint active
- WHEN the user views the Plans List screen
- THEN the system MUST fall back to `/plans` and successfully fetch and map the plans to the UI.

### Requirement: Create Plan
The system MUST create a plan using the `/subscriptions/plans` endpoint, and fall back to `/plans` if the first endpoint fails. The payload MUST map the frontend `benefits` array to a `features` array of strings expected by the backend.

#### Scenario: Creating a plan
- GIVEN the user fills out the new plan form
- WHEN the user submits the form
- THEN the system MUST send a valid payload to the backend and handle the response correctly.

### Requirement: Update Plan
The system MUST update a plan using the `/subscriptions/plans/:id` endpoint, and fall back to `/plans/:id` if the first endpoint fails. The payload MUST map the frontend `benefits` array to a `features` array of strings.

#### Scenario: Editing an existing plan
- GIVEN the user edits an existing plan
- WHEN the user submits the form
- THEN the system MUST send the updated payload to the backend and handle the response correctly.

### Requirement: Delete Plan
The system MUST delete a plan using the `/subscriptions/plans/:id` endpoint, and fall back to `/plans/:id` if the first endpoint fails.

## ADDED Requirements
None.

## REMOVED Requirements
None.