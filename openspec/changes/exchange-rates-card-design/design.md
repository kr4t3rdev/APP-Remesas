# Design: Rediseño de Tarjetas de Exchange Rates

## Technical Approach

El objetivo es simplificar el diseño de las tarjetas en la pantalla de "Exchange Rates" (Tasas de Cambio). Se solicita reemplazar el diseño actual que muestra la bandera del país dentro de un círculo (`currencyBadge` con `CountryFlag`) para que en su lugar se muestre únicamente el icono/símbolo de la moneda, eliminando la dependencia visual de la bandera.

## Architecture Decisions

### Decision: Mostrar Bandera sin Círculo de Fondo en Tarjetas

**Choice**: Eliminar el fondo circular (`currencyBadge`) en `ExchangeRatesScreen.tsx` para las tarjetas de tasas, y mostrar directamente el componente `CountryFlag` con un borde redondeado sutil en lugar del símbolo o el ícono de la moneda.
**Alternatives considered**: Mostrar el símbolo de la moneda en su lugar (se probó y el usuario prefirió la bandera directa).
**Rationale**: El usuario solicitó cambiar de vuelta para mostrar la bandera en lugar del ícono de la moneda, pero manteniendo un diseño más limpio sin el círculo de fondo original.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/screens/exchange-rates/ExchangeRatesScreen.tsx` | Modify | Actualizar el renderizado para remover el fondo circular y mostrar únicamente el `CountryFlag`. Se adaptó `currencySymbolContainer` para centrar la bandera sin fondo. |

## Open Questions

- Ninguna. Es un cambio puramente de presentación en la UI.
