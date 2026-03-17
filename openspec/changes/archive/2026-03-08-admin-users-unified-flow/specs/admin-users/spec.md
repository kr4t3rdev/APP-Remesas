# Admin Users Specification

## Purpose

This specification defines the unified admin user management flow, including navigation between screens, modal-based feedback, and flexible license-based filtering.

## Requirements

### Requirement: Unified Navigation Flow

The system SHALL provide seamless navigation between AdminUsersScreen and AdminUserManagementScreen, enabling admin users to manage users either globally (all system users) or within a specific license context.

#### Scenario: Navigate from AdminUsersScreen to User Management

- GIVEN the admin is on AdminUsersScreen viewing the global user list
- WHEN the admin taps on a user card
- THEN the app SHALL navigate to AdminUserManagementScreen displaying all system users
- AND the AdminUserManagementScreen SHALL operate without a licenseId filter

#### Scenario: Navigate from License Detail to User Management

- GIVEN the admin is on AdminLicenseDetailScreen viewing a specific license
- WHEN the admin taps the "Gestionar usuarios" action
- THEN the app SHALL navigate to AdminUserManagementScreen with the licenseId parameter
- AND the AdminUserManagementScreen SHALL filter users to show only those belonging to that license

### Requirement: Optional LicenseId Support

The AdminUserManagementScreen SHALL function correctly with or without a licenseId parameter, dynamically adjusting its data source and behavior accordingly.

#### Scenario: User Management Without LicenseId

- GIVEN AdminUserManagementScreen is opened without a licenseId parameter
- WHEN the screen loads
- THEN the system SHALL fetch all users from the system-wide admin users endpoint
- AND display the complete user list without license-based filtering

#### Scenario: User Management With LicenseId

- GIVEN AdminUserManagementScreen is opened with a valid licenseId parameter
- WHEN the screen loads
- THEN the system SHALL fetch users specific to that license using the license details endpoint
- AND display only users associated with that license

#### Scenario: User Management With Invalid LicenseId

- GIVEN AdminUserManagementScreen is opened with an invalid or non-existent licenseId
- WHEN the screen attempts to load users
- THEN the system SHALL handle the error gracefully
- AND display an appropriate error state with retry option

### Requirement: Modal-Based Feedback

The system SHALL replace all Alert.alert calls with proper modal components to provide visual feedback for user actions, ensuring consistent and accessible user experience.

#### Scenario: User Creation Success Feedback

- GIVEN an admin has successfully created a new user through AddUserFormModal
- WHEN the create user mutation completes successfully
- THEN the system SHALL display a success modal (AddUserSuccessModal) confirming the user was created
- AND the modal SHALL provide options to either add another user or return to the list

#### Scenario: User Creation Error Feedback

- GIVEN an admin is attempting to create a new user
- WHEN the create user mutation fails
- THEN the system SHALL display an error modal (ErrorModal) with the specific error message
- AND the modal SHALL allow the admin to retry or cancel

#### Scenario: User Update Success Feedback

- GIVEN an admin has successfully updated a user's basic information
- WHEN the update mutation completes successfully
- THEN the system SHALL automatically close the detail modal without showing an Alert
- AND the user list SHALL reflect the updated information

#### Scenario: User Update Error Feedback

- GIVEN an admin is attempting to update a user's information
- WHEN the update mutation fails
- THEN the system SHALL display an error modal (ErrorModal) with the specific error message
- AND the modal SHALL allow the admin to retry or cancel the operation

#### Scenario: Action Execution Success Feedback

- GIVEN an admin has executed a user control action (e.g., activate, deactivate, reset password)
- WHEN the action mutation completes successfully
- THEN the system SHALL display a success modal (SuccessModal) confirming the action was completed
- AND the modal SHALL provide appropriate next steps or close options

#### Scenario: Action Execution Error Feedback

- GIVEN an admin is attempting to execute a user control action
- WHEN the action mutation fails
- THEN the system SHALL display an error modal (ErrorModal) with the specific error message
- AND the modal SHALL allow the admin to retry the action

### Requirement: User Selection Behavior

The AdminUserManagementScreen SHALL implement consistent user selection behavior that aligns with the AdminUsersScreen modal pattern.

#### Scenario: User Card Tap Opens Detail Modal

- GIVEN the admin is viewing the user list in AdminUserManagementScreen
- WHEN the admin taps on a user card
- THEN the system SHALL open AdminUserDetailModal displaying the user's full information
- AND the modal SHALL provide options to edit, change role, or perform other actions

### Requirement: Consistency Between Screens

Both AdminUsersScreen and AdminUserManagementScreen SHALL provide a consistent user experience with matching UI patterns, modal systems, and interaction flows.

#### Scenario: Consistent Modal System

- GIVEN an admin is using either AdminUsersScreen or AdminUserManagementScreen
- WHEN performing equivalent actions (create user, update user, execute actions)
- THEN both screens SHALL use the same modal components
- AND the feedback behavior SHALL be identical across both screens

#### Scenario: Back Navigation Returns to Correct Screen

- GIVEN an admin navigated from AdminUsersScreen to AdminUserManagementScreen
- WHEN the admin taps the back button
- THEN the app SHALL navigate back to AdminUsersScreen
- AND the previous state of AdminUsersScreen SHALL be preserved

- GIVEN an admin navigated from AdminLicenseDetail to AdminUserManagementScreen
- WHEN the admin taps the back button
- THEN the app SHALL navigate back to AdminLicenseDetail
- AND the previous state of AdminLicenseDetail SHALL be preserved

## Data Models

### User (System-Wide)

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
  isActive: boolean;
  isBanned: boolean;
}
```

### LicenseUserDetail

```typescript
interface LicenseUserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'online' | 'offline' | 'inactive';
}
```

### Route Parameters

```typescript
// Without licenseId - loads all system users
type AdminUserManagementParams = undefined;

// With licenseId - loads license-specific users
type AdminUserManagementParams = {
  licenseId: number;
};
```

## Components

| Component | Purpose |
|-----------|---------|
| AdminUsersScreen | Main user list with search, filters, and user actions |
| AdminUserManagementScreen | License-scoped or global user management |
| AddUserFormModal | Form for creating new users |
| AddUserSuccessModal | Success feedback after user creation |
| AdminUserDetailModal | View and edit user details |
| SuccessModal | Generic success feedback for actions |
| ErrorModal | Error feedback with retry/cancel options |
| AdminActionConfirmModal | Confirmation for sensitive actions |
| AdminChangeRoleModal | Role change interface |
| AdminRoleChangeSuccessModal | Success after role change |
| AdminTempBlockModal | Temporary block interface |
| AdminTempBlockSuccessModal | Success after temporary block |
| AdminSuspendAccountModal | Suspension interface |
| AdminSuspendSuccessModal | Success after suspension |

## Success Criteria

1. Tapping a user in AdminUsersScreen navigates to AdminUserManagementScreen
2. AdminUserManagementScreen works without licenseId (shows all system users)
3. AdminUserManagementScreen works with licenseId (shows license-specific users)
4. No Alert.alert calls remain in either screen
5. All actions display feedback via modal components
6. Navigation from AdminLicenseDetail → AdminUserManagement continues to work
7. Consistent modal-based UX across both screens
