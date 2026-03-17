# Tasks: Admin Subscription Plans Management

## Phase 1: Foundation (Types & API)

- [ ] 1.1 Create `src/types/plans.ts` defining `Plan` and `PlanBenefit` interfaces.
- [ ] 1.2 Create `src/api/plansApi.ts` implementing mock CRUD operations (`getPlans`, `createPlan`, `updatePlan`, `deletePlan`) with initial dummy data.

## Phase 2: UI Components & Screens

- [ ] 2.1 Create `src/screens/admin/plans/AdminPlansListScreen.tsx` using `FlatList` to display plans with `InfoCard` or similar component.
- [ ] 2.2 Create `src/screens/admin/plans/AdminPlanCreateScreen.tsx` layout matching the design (Header, General Info inputs).
- [ ] 2.3 Implement dynamic "Benefits" list in `AdminPlanCreateScreen` (Add/Remove items locally).
- [ ] 2.4 Implement "Icon" selector in `AdminPlanCreateScreen`.
- [ ] 2.5 Implement "Save" action in `AdminPlanCreateScreen` calling `plansApi.createPlan`.

## Phase 3: Integration & Navigation

- [ ] 3.1 Modify `src/navigation/adminRoutes.tsx` to register `AdminPlansList` and `AdminPlanCreate` screens.
- [ ] 3.2 Modify `src/screens/admin/AdminServicesScreen.tsx` to add navigation handler to "Ver planes" button.

## Phase 4: Verification

- [ ] 4.1 Manual Verification: Navigate from Services to List, confirm dummy data loads.
- [ ] 4.2 Manual Verification: Navigate to Create, fill form, add benefits, select icon, save, and verify new plan appears in List.
