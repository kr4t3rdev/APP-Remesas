# Exchange Rates Validation Specification

## Purpose

Prevent users from attempting to create an exchange rate when there are not enough currencies configured in the system. An exchange rate requires at least a primary currency (e.g. CUP) and a secondary currency (e.g. USD, EUR).

## Requirements

### Requirement: Minimum Currencies Validation

The system MUST prevent the opening of the exchange rate creation modal if there are fewer than 2 currencies available in the system.

#### Scenario: Creating a rate with sufficient currencies

- GIVEN the user is on the Exchange Rates screen
- AND the system has 2 or more active currencies (e.g., CUP and USD)
- WHEN the user taps the "+" (add) button
- THEN the system MUST open the exchange rate creation modal
- AND the user can proceed to configure the rate

#### Scenario: Attempting to create a rate with insufficient currencies

- GIVEN the user is on the Exchange Rates screen
- AND the system has fewer than 2 currencies (e.g., only CUP, or none)
- WHEN the user taps the "+" (add) button
- THEN the system MUST NOT open the exchange rate creation modal
- AND the system MUST display an alert message informing the user that at least 2 currencies are required to configure exchange rates.
