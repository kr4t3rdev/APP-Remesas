import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AddUserFormModal } from '../AddUserFormModal';

describe('AddUserFormModal', () => {
  it('renders extended sections with required and optional fields in one flow', () => {
    const { getByText, getByTestId } = render(
      <AddUserFormModal visible onCancel={jest.fn()} onSubmit={jest.fn()} />,
    );

    expect(getByText('Identidad (required + perfil)')).toBeTruthy();
    expect(getByText('Contacto')).toBeTruthy();
    expect(getByText('Acceso y seguridad inicial')).toBeTruthy();
    expect(getByText('Preferencias de cuenta')).toBeTruthy();
    expect(getByText('Setup de licencia / cuenta')).toBeTruthy();

    expect(getByTestId('add-user-name-input')).toBeTruthy();
    expect(getByTestId('add-user-email-input')).toBeTruthy();
    expect(getByTestId('add-user-last-name-input')).toBeTruthy();
    expect(getByTestId('add-user-timezone-input')).toBeTruthy();
  });

  it('keeps optional values when required validation fails', async () => {
    const { getByTestId, getByText } = render(
      <AddUserFormModal visible onCancel={jest.fn()} onSubmit={jest.fn()} />,
    );

    fireEvent.changeText(getByTestId('add-user-last-name-input'), 'Pérez');
    fireEvent.press(getByTestId('add-user-submit-button'));

    await waitFor(() => {
      expect(getByText('El nombre es obligatorio')).toBeTruthy();
      expect(getByText('El email es obligatorio')).toBeTruthy();
    });

    expect(getByTestId('add-user-last-name-input').props.value).toBe('Pérez');
  });

  it('shows feedback as operational state signal (loading/error/success)', async () => {
    const { getByTestId, rerender } = render(
      <AddUserFormModal visible onCancel={jest.fn()} onSubmit={jest.fn()} loading />,
    );

    expect(getByTestId('add-user-submit-feedback').props.children).toBe('Procesando alta de usuario...');

    rerender(
      <AddUserFormModal
        visible
        onCancel={jest.fn()}
        onSubmit={jest.fn()}
        errorMessage="El email ya está registrado"
      />,
    );

    await waitFor(() => {
      expect(getByTestId('add-user-submit-feedback').props.children).toBe('El email ya está registrado');
    });

    rerender(
      <AddUserFormModal
        visible
        onCancel={jest.fn()}
        onSubmit={jest.fn()}
        successMessage="Usuario creado correctamente. Cerrando formulario..."
      />,
    );

    await waitFor(() => {
      expect(getByTestId('add-user-submit-feedback').props.children).toBe(
        'Usuario creado correctamente. Cerrando formulario...',
      );
    });
  });
});
