# Tasks: Admin User Details Screen

## Phase 1: Foundation

- [ ] 1.1 Update `src/api/licensesApi.ts` to include `fetchUserDetails(userId)` mock (or reuse existing user objects).

## Phase 2: UI Components

- [ ] 2.1 Create `src/components/admin/users/ActionGridItem.tsx` with icon, title, description, and press handler (Dark/Light support).
- [ ] 2.2 Create `src/screens/admin/users/AdminUserDetailsScreen.tsx` with Profile Header and Action Grid (Dark/Light support).

## Phase 3: Integration

- [ ] 3.1 Register `AdminUserDetails` route in `src/navigation/adminRoutes.tsx`.
- [ ] 3.2 Update `AdminUserManagementScreen` to navigate to `AdminUserDetails` on card press.

## Phase 4: Verification

- [ ] 4.1 Verify navigation from User List to User Detail.
- [ ] 4.2 Verify Dark/Light mode switching.
- [ ] 4.3 Check responsive layout of Action Grid.
