import React from "react";
import { CurrenciesScreen } from "../../currencies/CurrenciesScreen";
import { ExchangeRatesScreen } from "../../exchange-rates/ExchangeRatesScreen";

// Integrate the existing WorkerPaymentsScreen into the Workers tab
export const ExchangeTab = () => {
  return <ExchangeRatesScreen />;
};
