# Proposal: Admin User Details Screen

## Intent
Implement a detailed view for a specific user, allowing admins to see profile info and perform operative actions (suspend, reset password, change role, etc.).

## Context
Triggered by tapping a user card in `AdminUserManagementScreen`.

## Scope
- **Screen**: `AdminUserDetailsScreen`.
- **UI**: Consistent with Dark/Light theme support.
- **Header**: "User Details" with back button and menu.
- **Profile Section**:
    - Large Avatar with Status Indicator.
    - Name, Role, ID, Active Badge.
    - Action Buttons: "Edit Profile", "Message".
- **Operative Actions Grid**:
    - "Bloqueo Temporal" (Suspend access).
    - "Suspender Cuenta" (Deactivate).
    - "Forzar Password" (Reset).
    - "Revocar Sesiones" (Logout).
    - "Cambiar Rol".
    - "Gestionar Licencia".

## Approach
- Create `src/screens/admin/users/AdminUserDetailsScreen.tsx`.
- Create `ActionGridItem.tsx` component.
- Extend navigation to accept `userId`.
- Use mock logic for actions (alerts/toasts).
