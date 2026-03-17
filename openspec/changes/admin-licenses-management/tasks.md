# Tasks: Admin Licenses Management

## Phase 1: Foundation

- [ ] 1.1 Create `src/types/licenses.ts` with `License`, `LicenseUser`, and `LicenseStatus` definitions.
- [ ] 1.2 Create `src/api/licensesApi.ts` with mock data and `fetchLicenses` function.

## Phase 2: UI Components & Screens

- [ ] 2.1 Create `src/components/admin/licenses/LicenseCard.tsx` matching the design (Plan Name, ID, Badge, Users, Date).
- [ ] 2.2 Create `src/screens/admin/licenses/AdminLicensesListScreen.tsx` with `AdminHeader`, Search Bar, Tabs, and `FlatList`.
- [ ] 2.3 Implement Search and Filter logic in `AdminLicensesListScreen` (filter by tab + text search).

## Phase 3: Integration

- [ ] 3.1 Register `AdminLicensesList` in `src/navigation/adminRoutes.tsx`.
- [ ] 3.2 Update `src/screens/admin/AdminServicesScreen.tsx` to navigate to `AdminLicensesList` on "Configurar ahora".

## Phase 4: Verification

- [ ] 4.1 Verify navigation from Services -> Licenses.
- [ ] 4.2 Verify tab switching filters the list correctly.
- [ ] 4.3 Verify search input filters the list by plan name or user name.
