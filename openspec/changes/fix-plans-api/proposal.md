# Proposal: Fix Plans API Integration

## Intent
The user reported that subscription plans are not being displayed, and they cannot be created or edited. This implies a failure in the API layer (`plansApi.ts`) or how the frontend consumes it. The goal is to investigate and resolve the API communication for the Plans module.

## Scope
- Investigate `src/api/plansApi.ts` to ensure endpoints map correctly to the backend.
- Ensure the backend actually supports these endpoints (`/plans`). If it uses a different prefix (e.g., `/subscriptions/plans`), update the API calls.
- Verify payload structures for creation and editing.
- Fix UI state handling if errors are being silently swallowed.

## Affected Areas
- `src/api/plansApi.ts`
- `src/screens/admin/plans/AdminPlansListScreen.tsx`
- `src/screens/admin/plans/AdminPlanCreateScreen.tsx`