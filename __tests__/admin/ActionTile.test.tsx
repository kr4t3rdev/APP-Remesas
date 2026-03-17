import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { ActionTile } from '../../src/components/admin/ActionTile'

describe('ActionTile', () => {
  test('renders label and handles press', () => {
    const onPress = jest.fn()
    const { getByText } = render(<ActionTile label="Nueva" icon="add" onPress={onPress} />)
    expect(getByText('Nueva')).toBeTruthy()
    fireEvent.press(getByText('Nueva'))
    expect(onPress).toHaveBeenCalled()
  })
})
