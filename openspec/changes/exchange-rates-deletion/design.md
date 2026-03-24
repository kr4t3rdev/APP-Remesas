# Design: Delete Exchange Rate Functionality

## Technical Approach

We will introduce a "Delete Exchange Rate" functionality. The approach involves:
1. Adding a DELETE endpoint binding in the `exchange-rates.repository.ts` to request the backend to remove an exchange rate configuration for a specific currency.
2. Creating a React Query mutation `useDeleteExchangeRateMutation` in `useExchangeRates.ts` for handling loading and caching invalidation states.
3. Modifying the `ExchangeRatesScreen.tsx` modal (when editing an existing rate) to include a "Delete" button (using `DeleteButton` UI component or similar).
4. Showing a confirmation Alert to the user before executing the deletion. If the backend denies the request because the rate is implicated in transactions/movements, we will display an error alert catching that specific failure.

## Architecture Decisions

### Decision: Delete Action Location

**Choice**: Inside the "Edit Rate" modal.
**Alternatives considered**: Adding a swipe-to-delete gesture or an icon directly in the list.
**Rationale**: Exchange rates are sensitive entities. Placing the delete action inside the Edit Modal reduces the chances of accidental clicks, provides more space for a descriptive red button, and maintains the list view cleaner.

### Decision: Transaction/Movement Validation Handling

**Choice**: Catch validation error from the backend.
**Alternatives considered**: Pre-fetching validation to disable the button.
**Rationale**: The backend is the source of truth for database constraints. It is standard to attempt the DELETE operation and catch an HTTP 400/409/422 error if there are associated records (movements/transactions) preventing the deletion. We will show a friendly alert parsing the backend's rejection.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/modules/exchange-rates/infrastructure/exchange-rates.repository.ts` | Modify | Add `deleteExchangeRate` method pointing to `DELETE /exchange-rates/${currencyId}`. |
| `src/modules/exchange-rates/application/useExchangeRates.ts` | Modify | Add `useDeleteExchangeRateMutation` hooking into the repository and invalidating `exchangeRates` query key. |
| `src/screens/exchange-rates/ExchangeRatesScreen.tsx` | Modify | Add `handleDelete` method, confirmation `Alert`, and a UI button in the edit modal. |

## Open Questions

- None. Assuming the backend implements the standard constraint checks and returns an identifiable error if the currency has existing movements.
