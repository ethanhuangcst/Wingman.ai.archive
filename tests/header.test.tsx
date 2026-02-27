import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../app/components/Header';

describe('US-003-001 Header Component', () => {
  const mockUser = {
    name: 'Test User',
    profileImage: 'test-image.jpg'
  };

  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display Wingman logo on the left', () => {
    render(<Header user={mockUser} onLogout={mockOnLogout} />);
    
    const logoElement = screen.getByText('W');
    expect(logoElement).toBeInTheDocument();
    expect(logoElement.parentElement).toHaveClass('bg-blue-600');
  });

  it('should display app name "Wingman" next to the logo', () => {
    render(<Header user={mockUser} onLogout={mockOnLogout} />);
    
    const appName = screen.getByText('Wingman');
    expect(appName).toBeInTheDocument();
    expect(appName).toHaveClass('text-xl font-bold text-gray-900');
  });

  it('should display "Hello [User Name]" on the right', () => {
    render(<Header user={mockUser} onLogout={mockOnLogout} />);
    
    const greeting = screen.getByText(`Hello ${mockUser.name}`);
    expect(greeting).toBeInTheDocument();
  });

  it('should make User Name a URL pointing to Settings page', () => {
    render(<Header user={mockUser} onLogout={mockOnLogout} />);
    
    // This test will fail initially because the user name is not yet a link
    const settingsLink = screen.getByText(mockUser.name);
    expect(settingsLink.closest('a')).toHaveAttribute('href', '/settings');
  });

  it('should display a fixed-size thumbnail of the user\'s profile image', () => {
    render(<Header user={mockUser} onLogout={mockOnLogout} />);
    
    const profileImage = screen.getByAltText(mockUser.name);
    expect(profileImage).toBeInTheDocument();
    expect(profileImage).toHaveClass('w-full h-full rounded-full object-cover');
    expect(profileImage.parentElement).toHaveClass('w-8 h-8 rounded-full');
  });

  it('should display a default profile image placeholder when no profile image is set', () => {
    const userWithoutImage = { ...mockUser, profileImage: undefined };
    render(<Header user={userWithoutImage} onLogout={mockOnLogout} />);
    
    const placeholder = screen.getByText(userWithoutImage.name.charAt(0).toUpperCase());
    expect(placeholder).toBeInTheDocument();
    expect(placeholder.parentElement).toHaveClass('w-8 h-8 rounded-full bg-gray-200');
  });

  it('should display a logout button', () => {
    render(<Header user={mockUser} onLogout={mockOnLogout} />);
    
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveClass('text-sm text-gray-600 hover:text-gray-900 font-medium');
  });

  it('should call onLogout when logout button is clicked', () => {
    render(<Header user={mockUser} onLogout={mockOnLogout} />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });
});
