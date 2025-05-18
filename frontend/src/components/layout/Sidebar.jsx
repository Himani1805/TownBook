import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import {
  BookOpen,
  Calendar,
  Home,
  LayoutDashboard,
  Library,
  Settings,
  Users,
} from 'lucide-react';
// import Icon from 'lucide-react';
import { cn } from '@/lib/utils';

// Navigation item structure:
// {
//   title: String,        // Display text for the navigation item
//   href: String,         // URL path for the navigation link
//   icon: ReactComponent,  // Icon component from lucide-react
//   roles: [String]?      // Optional: Array of roles that can see this item
// }

const sidebarNavItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    title: 'Books',
    href: '/books',
    icon: BookOpen,
  },
  {
    title: 'Reading Rooms',
    href: '/rooms',
    icon: Library,
  },
  {
    title: 'Reservations',
    href: '/reservations',
    icon: Calendar,
  },
  {
    title: 'Admin',
    href: '/admin',
    icon: LayoutDashboard,
    roles: ['librarian'],
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    roles: ['librarian'],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export const Sidebar = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const filteredNavItems = sidebarNavItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  return (
    <aside className="fixed top-16 left-0 z-40 w-64 h-screen transition-transform -translate-x-full md:translate-x-0 border-r border-border">
      <div className="h-full px-3 py-4 overflow-y-auto bg-background">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center p-2 text-base font-normal rounded-lg',
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800',
                    'transition-colors duration-200'
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="ml-3">{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};
