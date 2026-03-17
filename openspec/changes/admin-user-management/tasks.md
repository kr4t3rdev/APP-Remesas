# Tasks: Admin User Management Screen

## Phase 1: Foundation & Data

- [ ] 1.1 Ensure `LicenseUserDetail` interface in `src/types/licenses.ts` supports role and status fields (already done in previous steps, verify).
- [ ] 1.2 Update `src/api/licensesApi.ts` mock data to include varied roles (ADMINISTRADOR, EDITOR, VISUALIZADOR, INACTIVO) and statuses matching the design.

## Phase 2: UI Components

- [ ] 2.1 Create `src/components/admin/users/UserManagementCard.tsx` implementing the dark theme card with Avatar, Name, Email, Role Badge, and Status Dot.
- [ ] 2.2 Create `src/screens/admin/users/AdminUserManagementScreen.tsx` with Dark Theme Container, Header (Add User), Search Bar, Filter Tabs, and User List.

## Phase 3: Integration

- [ ] 3.1 Register `AdminUserManagement` route in `src/navigation/adminRoutes.tsx`.
- [ ] 3.2 Update `src/screens/admin/licenses/AdminLicenseDetailScreen.tsx` to navigate to `AdminUserManagement` when clicking "Gestionar roles".

## Phase 4: Verification

- [ ] 4.1 Verify navigation from License Detail -> User Management.
- [ ] 4.2 Verify Dark Theme styling matches the screenshot.
- [ ] 4.3 Verify Search and Filter interactions.
