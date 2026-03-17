# Design: Admin Subscription Plans Management

## Technical Approach
We will implement a standard CRUD flow for Subscription Plans within the Admin Hub.
1.  **Navigation**: Extend `AdminRoutes` stack to include `AdminPlansList` and `AdminPlanCreate`.
2.  **State**: Use a mock API (`src/api/plansApi.ts`) to simulate backend operations for now, managed by `useEffect` and local state in screens.
3.  **UI**: Build `AdminPlanCreateScreen` to match the provided design (Name, Price, Benefits list, Icon selection).

## Architecture Decisions

### Decision: Navigation Structure
**Choice**: Add screens directly to `AdminRoutes` stack.
**Rationale**: `AdminRoutes` is already a Native Stack Navigator. Adding screens here allows seamless transition from `AdminServicesScreen`.
**Routes**:
- `AdminPlansList`: Lists all plans.
- `AdminPlanCreate`: Create or Edit a plan.

### Decision: Data Model
**Choice**: Define `Plan` interface in `src/types/plans.ts`.
**Rationale**: Centralize type definitions.
```typescript
export interface PlanBenefit {
  id: string;
  text: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  benefits: PlanBenefit[];
  icon: 'star' | 'diamond' | 'rocket' | 'flash'; // constrained list based on UI
}
```

## Data Flow
1.  **Entry**: User taps "Ver planes" in `AdminServicesScreen`.
2.  **List**: `AdminPlansListScreen` fetches plans from `plansApi.getPlans()`.
3.  **Create**: User taps "Nuevo Plan". Navigates to `AdminPlanCreateScreen`.
4.  **Input**: User fills form. Benefits are managed in a local array.
5.  **Save**: User taps "Guardar Plan". Calls `plansApi.createPlan(data)`.
6.  **Return**: On success, navigate back to List and refresh.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/types/plans.ts` | Create | Define `Plan` and `PlanBenefit` interfaces. |
| `src/api/plansApi.ts` | Create | Mock API for CRUD operations on plans. |
| `src/screens/admin/plans/AdminPlansListScreen.tsx` | Create | List view of current plans. |
| `src/screens/admin/plans/AdminPlanCreateScreen.tsx` | Create | Form to create/edit plans (matches UI design). |
| `src/navigation/adminRoutes.tsx` | Modify | Add `AdminPlansList` and `AdminPlanCreate` routes. |
| `src/screens/admin/AdminServicesScreen.tsx` | Modify | Wire up "Ver planes" button to navigate to `AdminPlansList`. |

## Interfaces / Contracts

### `src/types/plans.ts`
```typescript
export type PlanIconType = 'star' | 'diamond' | 'rocket' | 'flash';

export interface PlanBenefit {
  id: string;
  text: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  benefits: PlanBenefit[];
  icon: PlanIconType;
  isActive: boolean;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `plansApi` | Verify mock CRUD logic. |
| Unit | `AdminPlanCreateScreen` | Verify form validation and "Add Benefit" logic. |
| Integration | Navigation | Verify flow from Services -> List -> Create -> Save -> List. |

## Open Questions
- None. Design follows explicit user visual and verbal instructions.
