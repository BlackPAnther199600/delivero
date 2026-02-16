import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';
import { authAPI } from '../../services/api';

// Mock the API module
jest.mock('../../services/api');
const mockAuthAPI = authAPI;

describe('LoginForm Component', () => {
  const mockOnLoginSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form correctly', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    expect(screen.getByText('🔐 Accedi')).toBeInTheDocument();
    expect(screen.getByLabelText(/📧 email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/🔒 password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🚀 accedi/i })).toBeInTheDocument();
  });

  it('updates input fields when user types', async () => {
    const user = userEvent.setup();
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const emailInput = screen.getByLabelText(/📧 email/i);
    const passwordInput = screen.getByLabelText(/🔒 password/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: {
        token: 'mock-token',
        user: { id: 1, email: 'test@example.com', name: 'Test User' }
      }
    };
    
    mockAuthAPI.login.mockResolvedValue(mockResponse);
    
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const emailInput = screen.getByLabelText(/📧 email/i);
    const passwordInput = screen.getByLabelText(/🔒 password/i);
    const submitButton = screen.getByRole('button', { name: /🚀 accedi/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockAuthAPI.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
    
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockResponse.data.user));
    });
    
    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalledWith(mockResponse.data.user);
    });
  });

  it('displays error message on login failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';
    mockAuthAPI.login.mockRejectedValue({
      response: { data: { message: errorMessage } }
    });
    
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const emailInput = screen.getByLabelText(/📧 email/i);
    const passwordInput = screen.getByLabelText(/🔒 password/i);
    const submitButton = screen.getByRole('button', { name: /🚀 accedi/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    
    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    mockAuthAPI.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const emailInput = screen.getByLabelText(/📧 email/i);
    const passwordInput = screen.getByLabelText(/🔒 password/i);
    const submitButton = screen.getByRole('button', { name: /🚀 accedi/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(screen.getByRole('button', { name: /⏳ accesso in corso\.\.\./i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not submit empty form', async () => {
    const user = userEvent.setup();
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
    
    const submitButton = screen.getByRole('button', { name: /🚀 accedi/i });
    await user.click(submitButton);
    
    // Form should not submit if required fields are empty
    expect(mockAuthAPI.login).not.toHaveBeenCalled();
  });
});
