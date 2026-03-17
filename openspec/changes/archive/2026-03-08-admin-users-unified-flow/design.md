# Design: Admin Users Unified Flow

## Technical Approach

This change unifies the admin user management experience by connecting `AdminUsersScreen` with `AdminUserManagementScreen` and replacing native `Alert.alert` calls with modal-based feedback. The solution makes `licenseId` optional in `AdminUserManagementScreen`, allowing it to display either license-scoped users (when licenseId is provided) or all system users (when no licenseId is provided).

## Architecture Decisions

### Decision: Optional LicenseId Parameter

**Choice**: Make `licenseId` an optional parameter in `AdminUserManagementScreen` navigation params
**Alternatives considered**: 
- Creating a separate screen for global user management
- Using query parameters instead of route params

**Rationale**: Minimizes code duplication and maintains UI consistency. The existing `AdminUserManagementScreen` has the same layout and functionality needed for both use cases. Route params in React Navigation support optional parameters natively.

### Decision: Data Source Selection

**Choice**: Use `useAdminUsersQuery` for global users (no licenseId) and `licensesApi.fetchLicenseDetails` for license-scoped users
**Alternatives considered**:
- Creating a unified API endpoint that accepts optional licenseId
- Transforming one data type to match the other

**Rationale**: Leverages existing hooks and APIs without backend changes. The two data types (`User` vs `LicenseUserDetail`) have different structures, so normalizing them would require additional transformation logic that adds complexity without benefit.

### Decision: Modal Component Strategy

**Choice**: Reuse existing modal components from `AdminUsersScreen` in `AdminUserManagementScreen`
**Alternatives considered**:
- Creating entirely new modal components
- Using a generic modal wrapper

**Rationale**: Maintains consistency across screens and reduces code duplication. The existing modals (`AddUserFormModal`, `AdminUserDetailModal`, success modals, etc.) already handle all required user management actions.

### Decision: Alert.alert Replacement Locations

**Choice**: Replace all `Alert.alert` calls in `AdminUsersScreen` with appropriate modal feedback
**Alternatives considered**:
- Creating a global toast/notification system
- Inline error display within forms

**Rationale**: Modal feedback matches the existing UX pattern in the codebase. The spec explicitly requires modal-based feedback for consistency with other admin screens.

## Data Flow

```
AdminUsersScreen                              AdminUserManagementScreen
┌─────────────────────┐                      ┌─────────────────────────┐
│ Tap User Card       │                      │ Route Params            │
│         │           │                      │   - licenseId?         │
│         ▼           │                      │         │               │
│ Open Detail Modal   │                      │         ▼               │
│         │           │                      │ Check licenseId        │
│ Actions (edit,     │─── navigate ─────────►│         │               │
│   role change,     │    to                  │ licenseId? ──YES──────►│
│   suspend, etc.)   │    AdminUser           │    │                   │
│         │           │    Management         │    │ NO                │
│ Success/Error      │                      │    ▼                   │
│ via Alert.alert    │                      │ useAdminUsersQuery()   │
└─────────────────────┘                      │         │               │
                                               │         ▼               │
                                               │ Display User List       │
                                               │         │               │
                                               │ Same Modal System       │
                                               │ from AdminUsersScreen   │
                                               └─────────────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/screens/admin/AdminUsersScreen.tsx` | Modify | Change `onPress` on user card (line 215) to navigate to `AdminUserManagement` instead of opening modal. Remove when licenseId is not needed. Keep modal for quick actions if desired, or implement both flows. |
| `src/screens/admin/users/AdminUserManagementScreen.tsx` | Modify | Make `licenseId` optional, add modal imports and state, implement data fetching based on licenseId presence, add modal handlers |
| `src/navigation/adminRoutes.tsx` | Modify | No changes needed - route already accepts params object |
| `src/components/admin/SuccessModal.tsx` | Create | Generic success modal (if needed beyond existing specific success modals) |
| `src/components/admin/ErrorModal.tsx` | Create | Generic error modal (if needed beyond Alert replacement) |

## Interfaces / Contracts

### Route Parameters

```typescript
// AdminUserManagementScreen params
type AdminUserManagementParams = {
  licenseId?: number;  // Optional - undefined = all system users
} | undefined;
```

### User Data Types

```typescript
// Global users (from useAdminUsersQuery)
interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  isBanned: boolean;
}

// License-scoped users (from fetchLicenseDetails)
interface LicenseUserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'online' | 'offline' | 'inactive';
}
```

### Screen State Interface (AdminUserManagementScreen)

```typescript
interface AdminUserManagementState {
  users: User[] | LicenseUserDetail[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  activeTab: 'all' | 'admin' | 'active';
  // Modal visibility states (same as AdminUsersScreen)
  isAddUserModalVisible: boolean;
  selectedUser: User | LicenseUserDetail | null;
  // ... other modal states
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Modal state management, filtering logic | Test filteredUsers memoization |
| Integration | Navigation between screens, data loading | Test with mock navigation and API |
| E2E | Full user management flow | Playwright: navigate → select user → perform action → verify modal |

## Migration / Rollout

No migration required. This is a pure UI/UX enhancement that maintains backward compatibility:
- Existing navigation from `AdminLicenseDetail` → `AdminUserManagement` continues to work
- No database or API changes needed
- Can be deployed as a single atomic change

## Open Questions

- [ ] Should `AdminUsersScreen` still allow quick actions via modal, or should ALL user interactions go through `AdminUserManagementScreen`?
- [ ] Should we create unified `SuccessModal` and `ErrorModal` components, or continue using the existing patternals (e.g., `AdminRoleChangeSuccessModal`)?
- [ ]-specific mod Should we normalize the `User` and `LicenseUserDetail` types to share a common interface, or keep them separate as-is?
