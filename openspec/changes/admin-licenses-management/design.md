# Design: Admin Licenses Management

## Technical Approach
We will implement a standard list view with filtering and search capabilities for license management.
1.  **Navigation**: Add `AdminLicensesList` to `AdminRoutes` stack.
2.  **State**: Use `licensesApi` (mock) for data fetching. Local state for search query and active tab filter.
3.  **UI**: Build `AdminLicensesListScreen` matching the visual design (Header, Search, Tabs, License Cards).

## Architecture Decisions

### Decision: Data Model
**Choice**: Define `License` interface in `src/types/licenses.ts`.
**Rationale**: Centralize type definitions.
```typescript
export type LicenseStatus = 'active' | 'expired' | 'subscribed' | 'pending';

export interface LicenseUser {
  id: string;
  name: string;
  avatarUrl?: string; // or initials fallback
}

export interface License {
  id: string;
  planName: string; // e.g., "Enterprise Pro Cloud"
  licenseId: string; // e.g., "8829-XJ21-LL09"
  status: LicenseStatus;
  users: LicenseUser[];
  expiryDate?: string; // ISO date string
  autoRenew?: boolean;
}
```

### Decision: Filter Logic
**Choice**: Client-side filtering for MVP.
**Rationale**: With mock data or small datasets, client-side filtering is instant and simpler.

## Data Flow
1.  **Entry**: User taps "Configurar ahora" in `AdminServicesScreen`.
2.  **List**: `AdminLicensesListScreen` fetches all licenses.
3.  **Filter/Search**: User types or changes tab -> Local state updates -> `filteredLicenses` computed property updates list.
4.  **Display**: `FlatList` renders `LicenseCard` components.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/types/licenses.ts` | Create | Define `License` and related interfaces. |
| `src/api/licensesApi.ts` | Create | Mock API for fetching licenses. |
| `src/screens/admin/licenses/AdminLicensesListScreen.tsx` | Create | Main list screen with search and tabs. |
| `src/components/admin/licenses/LicenseCard.tsx` | Create | Reusable card component for each license item. |
| `src/navigation/adminRoutes.tsx` | Modify | Add `AdminLicensesList` route. |
| `src/screens/admin/AdminServicesScreen.tsx` | Modify | Wire up "Configurar ahora" button. |

## Interfaces / Contracts

### `src/types/licenses.ts`
```typescript
export type LicenseStatus = 'active' | 'expired' | 'subscribed' | 'pending';

export interface LicenseUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface License {
  id: string;
  planName: string;
  licenseKey: string;
  status: LicenseStatus;
  assignedUsers: LicenseUser[];
  expiryDate?: string; // "12 Dic 2024" or ISO
  autoRenew: boolean;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `licensesApi` | Verify mock fetch. |
| Unit | `AdminLicensesListScreen` | Verify search and tab filtering logic. |
| Integration | Navigation | Verify flow from Services -> Licenses List. |

## Open Questions
- None. Design follows provided mockups.
