# Design: Admin License Detail View

## Technical Approach
Implement `AdminLicenseDetailScreen` as a detail view consuming the `License` object passed via navigation params (or fetched by ID).
1.  **Navigation**: Add `AdminLicenseDetail` to `AdminRoutes`.
2.  **UI**:
    - **Header**: Use `AdminHeader`.
    - **Summary Card**: Custom component with Progress Bar.
    - **User List**: `FlatList` with `LicenseUserRow` component.

## Architecture Decisions

### Decision: Data Source
**Choice**: Pass `licenseId` via navigation params and fetch details (including full user list) from `licensesApi`.
**Rationale**: Keeps data fresh and allows deep linking in future.

### Decision: Component Structure
**Choice**: Split into `LicenseSummaryCard` and `LicenseUserList`.
**Rationale**: Reusability and cleaner screen code.

## Data Flow
1.  **Entry**: Tap card in `AdminLicensesListScreen`.
2.  **Load**: `AdminLicenseDetailScreen` mounts, calls `licensesApi.fetchLicenseDetails(id)`.
3.  **Render**: Shows loading -> Shows content.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/screens/admin/licenses/AdminLicenseDetailScreen.tsx` | Create | Main detail screen. |
| `src/components/admin/licenses/LicenseSummaryCard.tsx` | Create | Top card with progress bar. |
| `src/components/admin/licenses/LicenseUserRow.tsx` | Create | Row item for user list. |
| `src/api/licensesApi.ts` | Modify | Add `fetchLicenseDetails` mock. |
| `src/navigation/adminRoutes.tsx` | Modify | Add route. |

## Interfaces / Contracts

### `src/types/licenses.ts` (Update)
```typescript
export interface LicenseDetail extends License {
  billingCycle: string; // "Facturación Anual"
  maxUsers: number;
  usedUsers: number;
  fullUserList: LicenseUserDetail[];
}

export interface LicenseUserDetail {
  id: string;
  name: string;
  email: string;
  role: string; // "Admin", "Editor", "Viewer"
  status: 'online' | 'offline';
  avatarUrl?: string;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `LicenseSummaryCard` | Verify progress bar calculation. |
| Integration | Navigation | Verify params passing from List to Detail. |

## Open Questions
- None.
