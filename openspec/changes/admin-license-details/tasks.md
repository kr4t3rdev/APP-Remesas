# Tasks: Admin License Detail View

## Phase 1: Foundation

- [ ] 1.1 Update `src/types/licenses.ts` to include `LicenseDetail` and `LicenseUserDetail`.
- [ ] 1.2 Update `src/api/licensesApi.ts` to include `fetchLicenseDetails` with extended mock data.

## Phase 2: UI Components

- [ ] 2.1 Create `src/components/admin/licenses/LicenseSummaryCard.tsx` with progress bar and plan info.
- [ ] 2.2 Create `src/components/admin/licenses/LicenseUserRow.tsx` displaying avatar, name, email, and role/status.

## Phase 3: Screen & Integration

- [ ] 3.1 Create `src/screens/admin/licenses/AdminLicenseDetailScreen.tsx` assembling components.
- [ ] 3.2 Register `AdminLicenseDetail` route in `src/navigation/adminRoutes.tsx`.
- [ ] 3.3 Update `AdminLicensesListScreen` to navigate to detail screen on card tap.

## Phase 4: Verification

- [ ] 4.1 Verify navigation from List to Detail.
- [ ] 4.2 Verify correct data display (quota progress, user list) for different mock licenses.
