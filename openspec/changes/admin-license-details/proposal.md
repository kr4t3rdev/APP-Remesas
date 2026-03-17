# Proposal: Admin License Detail View

## Intent
Implement the detail view for a specific license, allowing admins to see usage metrics (quota) and manage assigned users.

## Context
We have the list view (`AdminLicensesListScreen`). Tapping a license card needs to open this detail view.

## Scope
- **Screen**: `AdminLicenseDetailScreen`.
- **Header**: "Usuarios por Licencia" with back button and search icon.
- **Summary Card**:
    - License Name, Billing Type, ID.
    - Usage Progress Bar (e.g., "45 / 50").
- **User List**:
    - "Gestionar roles" link.
    - List of users with Avatar, Name, Email, and Status Indicator (green dot).
- **FAB**: Add user button.

## Approach
- Add `AdminLicenseDetail` route.
- Create screen and components.
- Mock user data for the specific license.
