# Design: Admin User Management Screen

## Technical Approach
Implement a standalone screen `AdminUserManagementScreen` with a dark theme aesthetic.
1.  **Navigation**: Add to `AdminRoutes`.
2.  **Data**: Consume `fullUserList` from the passed `licenseId` (fetching via `licensesApi`).
3.  **UI**: Custom dark theme implementation.

## Architecture Decisions

### Decision: Theme
**Choice**: Local dark theme overrides for this screen.
**Rationale**: The requirement is "create identical" to the dark mode screenshot, while the rest of the admin app is light. We will wrap the screen in a dark container and use specific colors.
- Background: `#0f172a` (Slate 900)
- Card Background: `#1e293b` (Slate 800)
- Text: `#f8fafc` (Slate 50) / `#94a3b8` (Slate 400)

### Decision: Components
**Choice**: Create `UserManagementCard` specific to this view.
**Rationale**: The design differs significantly from `LicenseUserRow` (dark mode, badges, spacing).

## Data Flow
1.  **Entry**: "Gestionar roles" -> `navigation.navigate('AdminUserManagement', { licenseId })`.
2.  **Load**: Fetch license details to get users.
3.  **Render**: List users with role badges.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/screens/admin/users/AdminUserManagementScreen.tsx` | Create | Main screen. |
| `src/components/admin/users/UserManagementCard.tsx` | Create | Dark theme user card. |
| `src/navigation/adminRoutes.tsx` | Modify | Add route. |
| `src/screens/admin/licenses/AdminLicenseDetailScreen.tsx` | Modify | Link "Gestionar roles" button. |

## Interfaces / Contracts

### Role Badge Colors
- **ADMINISTRADOR**: Blue text/bg
- **EDITOR**: Gray/White text/bg
- **VISUALIZADOR**: Gray text/bg
- **INACTIVO**: Red text/bg

## Testing Strategy
- Manual verification of UI match against screenshot.
- Verify filtering logic (All/Admin/Active).
