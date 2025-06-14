import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import { AdminGuard } from '../admin-guard';
import { UserContext, UserContextValue, Role, User } from '@/contexts/user-context';
import { paths } from '@/paths';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const baseContext: UserContextValue = {
  user: null,
  error: null,
  isLoading: false,
  checkSession: jest.fn(),
  signOut: jest.fn(),
};

function renderWithUser(user: User | null) {
  return render(
    <UserContext.Provider value={{ ...baseContext, user }}>
      <AdminGuard>
        <div>protected</div>
      </AdminGuard>
    </UserContext.Provider>
  );
}

describe('AdminGuard', () => {
  beforeEach(() => {
    mockReplace.mockReset();
  });

  it('renders children for admin user', async () => {
    const admin: User = {
      id: '1',
      kullaniciAdi: 'Admin',
      email: 'a@a.a',
      roller: [{ id: 'r1', rolAdi: 'Yönetici' } as Role],
    };

    renderWithUser(admin);
    expect(await screen.findByText('protected')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('redirects non-admin user to dashboard', async () => {
    const user: User = {
      id: '2',
      kullaniciAdi: 'User',
      email: 'u@u.u',
      roller: [{ id: 'r2', rolAdi: 'Kullanici' } as Role],
    };

    renderWithUser(user);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(paths.dashboard.overview);
    });
  });
});
