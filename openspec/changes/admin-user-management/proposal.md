# Proposal: Admin User Management Screen

## Intent
Implement a user management screen to manage roles and statuses of users within a license context.

## Context
Triggered from "Gestionar roles" in `AdminLicenseDetailScreen`.

## Scope
- **Screen**: `AdminUserManagementScreen`.
- **UI**: Dark theme (as per visual reference).
- **Features**:
    - Header with "Add User" action.
    - Search Bar.
    - Filters: "Todos", "Admin", "Activos".
    - List of users with:
        - Avatar & Status dot.
        - Name & Email.
        - Role Badge (Administrator, Editor, Visualizador, Inactivo).
        - Context menu action.

## Approach
- Create `AdminUserManagementScreen.tsx`.
- Create `UserManagementCard.tsx` for the list item.
- Use mock data initially (or extend `licensesApi`).
- Apply specific dark styling for this screen to match the mockup.
