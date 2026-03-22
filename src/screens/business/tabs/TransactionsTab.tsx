import React from 'react';
import { WorkerPaymentsScreen } from '../../worker-payments/WorkerPaymentsScreen';
import { TransactionsScreen } from '../../transactions/TransactionsScreen';

// Integrate the existing WorkerPaymentsScreen into the Workers tab
export const TransactionsTab = () => {
  return <TransactionsScreen />;
};
