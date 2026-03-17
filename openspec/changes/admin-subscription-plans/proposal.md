# Proposal: Admin Subscription Plans Management

## Intent
Enable administrators to manage subscription plans (create, edit, view) directly from the Admin Hub.

## Context
Currently, the "Planes de Suscripción" card in `AdminServicesScreen` is a placeholder. We need to implement the full flow to manage these plans.

## Scope
- **Entry Point**: "Ver planes" action in `AdminServicesScreen`.
- **List View**: A new screen to list existing plans (implied requirement).
- **Create/Edit View**: A new screen `AdminPlanCreateScreen` to create or edit a plan.
    - Fields: Name, Monthly Price, Benefits (dynamic list), Icon selector.
    - Actions: Save, Cancel.

## Approach
- Create new screens in `src/screens/admin/plans/`.
- Add navigation routes in `AdminRoutes`.
- Use a local store or mock API for now, designing for future backend integration.
