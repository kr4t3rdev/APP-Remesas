import React from 'react'
import { render, waitFor } from '@testing-library/react-native'
import AdminServicesScreen from '../../../src/screens/admin/AdminServicesScreen'

// Mock the adminMetricsApi to provide deterministic data
jest.mock('../../../src/api/adminMetricsApi', () => ({
  fetchAdminMetrics: jest.fn().mockResolvedValue({ activeCount: 1400, expiredCount: 20, activeDelta: '+10%', expiredDelta: '-2%' }),
}))

describe('AdminServicesScreen', () => {
  test('renders header, sections and tiles', async () => {
    const { getByText } = render(<AdminServicesScreen />)

    // Wait for header and sections to render after metrics load
    await waitFor(() => {
      expect(getByText('Servicios de Finanzas')).toBeTruthy()
      expect(getByText('Gestión Principal')).toBeTruthy()
      expect(getByText('Gestión de Licencias')).toBeTruthy()
      expect(getByText('Planes de Suscripción')).toBeTruthy()
    })

    expect(getByText('Nueva')).toBeTruthy()
  })
})
