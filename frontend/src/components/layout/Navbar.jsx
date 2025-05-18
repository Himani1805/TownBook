import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';
import { LogOut, Menu, User } from 'lucide-react';
import { useState } from 'react';
import { useLogoutMutation } from '@/features/auth/authApi';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm dark:bg-gray-900">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">TownBook</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/books"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-primary dark:text-gray-200 dark:hover:text-white"
            >
              Books
            </Link>
            <Link
              to="/rooms"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-primary dark:text-gray-200 dark:hover:text-white"
            >
              Reading Rooms
            </Link>
            <Link
              to="/reservations"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-primary dark:text-gray-200 dark:hover:text-white"
            >
              My Reservations
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center ml-4 md:ml-6">
            <div className="relative ml-3">
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 transition-colors hover:text-primary dark:text-gray-200 dark:hover:text-white"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline">
                    {user?.name || 'Profile'}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline ml-2">Sign out</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 text-gray-700 rounded-md hover:text-primary hover:bg-gray-100 focus:outline-none dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/books"
              className="block px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Books
            </Link>
            <Link
              to="/rooms"
              className="block px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Reading Rooms
            </Link>
            <Link
              to="/reservations"
              className="block px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Reservations
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
