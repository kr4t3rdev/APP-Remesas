# Tasks: Admin Users Unified Flow

## Phase 1: Foundation (Create Modal Components)

- [x] 1.1 Create `src/components/admin/SuccessModal.tsx` — Generic success modal with customizable title, message, and close button
- [x] 1.2 Create `src/components/admin/ErrorModal.tsx` — Generic error modal with error message, retry and cancel actions

## Phase 2: AdminUsersScreen Modals

- [x] 2.1 Import `SuccessModal` and `ErrorModal` in `AdminUsersScreen.tsx`
- [x] 2.2 Add modal visibility state for success feedback (lines 102, 176): `const [successModalState, setSuccessModalState] = useState({ visible: false, title: '', message: '' })`
- [x] 2.3 Add modal visibility state for error feedback (lines 104, 119, 185): `const [errorModalState, setErrorModalState] = useState({ visible: false, title: '', message: '' })`
- [x] 2.4 Replace `Alert.alert('Éxito', ...)` (line 102) with `setSuccessModalState({ visible: true, title: 'Usuario creado', message: '...' })` after user creation
- [x] 2.5 Replace `Alert.alert('Error', ...)` (line 104) with `setErrorModalState` for user creation errors
- [x] 2.6 Replace `Alert.alert('Error', ...)` (line 119) with `setErrorModalState` for user update errors
- [x] 2.7 Replace `Alert.alert('Éxito', ...)` (line 176) with `setSuccessModalState` for action execution success
- [x] 2.8 Replace `Alert.alert('Error', ...)` (line 185) with `setErrorModalState` for action execution errors
- [x] 2.9 Add `SuccessModal` component to JSX (before closing SafeAreaView)
- [x] 2.10 Add `ErrorModal` component to JSX
- [x] 2.11 Remove `Alert` import (no longer needed)

## Phase 3: AdminUserManagementScreen Updates

- [x] 3.1 Make `licenseId` optional in route params: `const { licenseId } = route.params ?? {};`
- [x] 3.2 Update `useEffect` to conditionally fetch users based on `licenseId` presence
- [x] 3.3 If `licenseId` exists: use `licensesApi.fetchLicenseDetails(licenseId)` (existing)
- [x] 3.4 If no `licenseId`: import and use `useAdminUsersQuery()` hook
- [x] 3.5 Import all modal components (AddUserFormModal, AdminUserDetailModal, etc.)
- [x] 3.6 Add modal visibility states (same pattern as AdminUsersScreen)
- [x] 3.7 Implement `handleCreateUser`, `handleUpdateBasic`, `handleActionRequest`, `executeAction` handlers
- [x] 3.8 Change user card `onPress` to open `AdminUserDetailModal` instead of navigating to `AdminUserDetails`
- [x] 3.9 Add all modal components to JSX render
- [x] 3.10 Handle user type mismatch: convert between `User` (global) and `LicenseUserDetail` types when needed

## Phase 4: Navigation Integration

- [x] 4.1 Update `AdminUsersScreen` user card `onPress` (line 247) to navigate to `AdminUserManagement` route (without params) instead of opening modal
- [x] 4.2 Verify `adminRoutes.tsx` has proper route definition for `AdminUserManagement` with optional params

## Phase 5: Testing & Verification

- [ ] 5.1 Test navigation from `AdminUsersScreen` → `AdminUserManagementScreen` (without licenseId)
- [ ] 5.2 Test navigation from `AdminLicenseDetail` → `AdminUserManagementScreen` (with licenseId)
- [ ] 5.3 Test user creation flow with success modal feedback
- [ ] 5.4 Test user update flow with error modal feedback
- [ ] 5.5 Test action execution (activate/deactivate) with success modal
- [ ] 5.6 Verify no `Alert.alert` calls remain in either screen
- [ ] 5.7 Test back navigation returns to correct previous screen
