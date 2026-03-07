import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { AdminHomeHeroCard } from '../AdminHomeHeroCard';

describe('AdminHomeHeroCard', () => {
  const defaultProps = {
    title: 'Total usuarios',
    value: 150,
    onPrimaryAction: jest.fn(),
    onSecondaryAction: jest.fn(),
    primaryLabel: 'Reportes',
    secondaryLabel: 'Actualizar',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and value correctly', () => {
    const { getByText } = render(<AdminHomeHeroCard {...defaultProps} />);

    expect(getByText('Total usuarios')).toBeTruthy();
    expect(getByText('150')).toBeTruthy();
  });

  it('renders primary and secondary button labels', () => {
    const { getByText } = render(<AdminHomeHeroCard {...defaultProps} />);

    expect(getByText('Reportes')).toBeTruthy();
    expect(getByText('Actualizar')).toBeTruthy();
  });

  it('calls onPrimaryAction when primary button is pressed', () => {
    const onPrimaryAction = jest.fn();
    const { getByText } = render(<AdminHomeHeroCard {...defaultProps} onPrimaryAction={onPrimaryAction} />);

    fireEvent.press(getByText('Reportes'));

    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
  });

  it('calls onSecondaryAction when secondary button is pressed', () => {
    const onSecondaryAction = jest.fn();
    const { getByText } = render(<AdminHomeHeroCard {...defaultProps} onSecondaryAction={onSecondaryAction} />);

    fireEvent.press(getByText('Actualizar'));

    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it('renders trend indicator when provided', () => {
    const { getByText } = render(
      <AdminHomeHeroCard {...defaultProps} trend="up" trendLabel="10% vs mes pasado" />
    );

    // Trend text includes the prefix based on trend direction
    expect(getByText('+10% vs mes pasado')).toBeTruthy();
  });

  it('renders string value correctly', () => {
    const { getByText } = render(<AdminHomeHeroCard {...defaultProps} value="N/A" />);

    expect(getByText('N/A')).toBeTruthy();
  });

  it('formats numeric values with locale separator', () => {
    const { getByText } = render(<AdminHomeHeroCard {...defaultProps} value={1234} />);

    expect(getByText('1,234')).toBeTruthy();
  });
});
