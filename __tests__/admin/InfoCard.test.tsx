import React from 'react'
import { render } from '@testing-library/react-native'
import { InfoCard } from '../../src/components/admin/InfoCard'

describe('InfoCard', () => {
  test('renders title, formatted value and delta', () => {
    const { getByText } = render(
      <InfoCard title="ACTIVAS" value={1240} delta={'+12%'} deltaColor="green" />
    )
    // Title
    expect(getByText('ACTIVAS')).toBeTruthy()
    // Formatted value (1,240 in en locale)
    expect(getByText(/1[,.]?240/)).toBeTruthy()
    // Delta
    expect(getByText('+12%')).toBeTruthy()
  })
})
