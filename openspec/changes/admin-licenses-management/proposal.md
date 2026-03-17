# Proposal: Admin Licenses Management

## Intent
Implement a comprehensive license management interface within the Admin Hub, allowing administrators to view, search, and filter user licenses.

## Context
Currently, the "Gestión de Licencias" card in `AdminServicesScreen` is inactive. We need to implement the list view as shown in the provided design mockups.

## Scope
- **Entry Point**: "Configurar ahora" action in `AdminServicesScreen` -> "Gestión de Licencias".
- **List View**: `AdminLicensesListScreen` featuring:
    - **Header**: "Listado de Licencias" with search and menu actions.
    - **Search Bar**: "Buscar licencias o usuarios".
    - **Tabs**: Todas, Activas, Expiradas, Pendientes.
    - **License Cards**: Displaying License Name, ID, Status (Badge), Assigned Users (Avatars/Names), Expiry/Renewal info.
    - **FAB**: Add new license button.
- **Navigation**: Tapping a card will navigate to a details screen (future scope, but we'll set up the route).

## Approach
- Create `src/screens/admin/licenses/` directory.
- Define `License` data model in `src/types/licenses.ts`.
- Create mock `licensesApi.ts`.
- Implement `AdminLicensesListScreen` using `FlatList` and custom components for the card.
- Use `AdminHeader` for consistency.
