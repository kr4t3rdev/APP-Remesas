import React from 'react'
import { render } from '@testing-library/react-native'
import { BottomNav } from '../../src/components/admin/BottomNav'

describe('BottomNav', () => {
  test('renders navigation items and highlights active item', () => {
    const { getByText } = render(<BottomNav activeItem="Servicios" />)
    // Ensure items render
    expect(getByText('Inicio')).toBeTruthy()
    expect(getByText('Servicios')).toBeTruthy()
    expect(getByText('Reportes')).toBeTruthy()
    expect(getByText('Ajustes')).toBeTruthy()
  })
})
