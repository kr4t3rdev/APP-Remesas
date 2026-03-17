import React from 'react'
import { render } from '@testing-library/react-native'
import { GradientCard } from '../../src/components/admin/GradientCard'

describe('GradientCard', () => {
  test('renders title, subtitle and action label', () => {
    const { getByText } = render(
      <GradientCard title="Gestión de Licencias" subtitle="Control de acceso" actionLabel="Configurar ahora" />
    )
    expect(getByText('Gestión de Licencias')).toBeTruthy()
    expect(getByText('Control de acceso')).toBeTruthy()
    expect(getByText('Configurar ahora')).toBeTruthy()
  })
})
