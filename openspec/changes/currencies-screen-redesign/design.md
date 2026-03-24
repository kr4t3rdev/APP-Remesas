# Design: Currencies Screen Redesign (Viajero Global)

## Technical Approach

The `CurrenciesScreen` will be redesigned to match the provided UI mockup. The current vertical list layout will be transformed into a distinct split between the "Primary Currency" (Moneda Base de Viaje) and "Secondary Currencies" (Monedas en Tránsito). 

The screen will introduce:
1.  **Custom Header**: Replaces the default header with a custom one containing a back button (if applicable to navigation stack), title "Viajero Global", and an Add (`+`) button.
2.  **Primary Currency Card**: A prominent, large card highlighting the primary currency (e.g., CUP).
3.  **Secondary Currencies Carousel**: A horizontal scrollable list (`FlatList` horizontal) for other currencies, displaying options to set as primary, edit, and delete.
4.  **Market Status Indicator**: A bottom card showing the last update time for exchange rates.

## Architecture Decisions

### Decision: Layout Structure
**Choice**: Use a main `ScrollView` that contains the Primary Currency Card, the Secondary Currencies Horizontal `FlatList` (or a `ScrollView`), and the Market Status Card.
**Alternatives considered**: Keep a single `FlatList` with multiple view types.
**Rationale**: The layout is composed of distinct, static sections (Primary, Secondary, Market Status) rather than a uniform list. A `ScrollView` with nested components is more semantic and easier to style according to the new design.

### Decision: Componentizing Cards
**Choice**: Create separate internal or external components for `PrimaryCurrencyCard` and `SecondaryCurrencyCard`.
**Alternatives considered**: Inline all JSX within `CurrenciesScreen`.
**Rationale**: Componentizing improves readability and maintainability, especially since the `SecondaryCurrencyCard` has its own actions (Set Primary, Edit, Delete).

### Decision: Icons and Flags
**Choice**: Use placeholder colored rectangles or simple text icons for flags if a flag library is not currently installed, and utilize `@expo/vector-icons` for UI icons.
**Alternatives considered**: Introduce a new heavy dependency for flags (e.g., `react-native-country-flag`).
**Rationale**: Keeping dependencies low is preferred unless explicitly requested. We will use colored boxes or initial letters as a fallback if specific flag assets aren't available.

## Data Flow

```text
  CurrenciesScreen 
         │ (Queries & Mutations from useCurrencies)
         ├─→ PrimaryCurrencyCard (Displays `primaryCurrency`)
         │
         ├─→ SecondaryCurrencyCarousel 
         │      └─→ SecondaryCurrencyCard (Displays `currency`, emits `onSetPrimary`, `onEdit`, `onDelete`)
         │
         └─→ MarketStatusCard (Displays last sync time, triggers refresh)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/screens/currencies/CurrenciesScreen.tsx` | Modify | Restructure the UI to match the new design, update styles heavily, add new sections (Primary, Secondary, Market Status). |
| `src/screens/currencies/components/PrimaryCurrencyCard.tsx` | Create | (Optional) New component for the primary currency card to keep screen clean. |
| `src/screens/currencies/components/SecondaryCurrencyCard.tsx` | Create | (Optional) New component for the secondary currency cards in the carousel. |

## Interfaces / Contracts

No new API contracts are required. We will reuse the existing `Currency` type and the React Query hooks:
- `useCurrenciesWithPrimaryQuery`
- `useCreateCurrencyMutation`
- `useSetPrimaryCurrencyMutation`
- *(New)* `useDeleteCurrencyMutation` (if deleting is supported by the backend, otherwise we need to implement it or mock it).

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Component rendering | Verify that `CurrenciesScreen` renders the primary card and secondary carousel correctly. |
| Integration | Interactions | Test the "Set Primary" button click on a secondary currency card updates the UI. |

## Migration / Rollout

No migration required. The data structure for currencies remains unchanged.

## Open Questions

- [ ] Does the "Quitar" (Delete) button require a new backend mutation, or is it already implemented in `useCurrencies`?
- [ ] Where does the "Estado del Mercado" data come from? Do we have a query for the last sync time, or should it be mocked/derived from the currency query timestamp?
- [ ] Is the "Viajero Global" title dynamic based on the trip, or static?
