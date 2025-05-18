import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { Button } from '../components/ui/Button';
import { BookOpen, Clock, Library, Users } from 'lucide-react';
import { useGetUserReservationsQuery } from '../features/reservations/reservationsApi';
import { format } from 'date-fns';
import ErrorBoundary from '../components/ErrorBoundary';

// Format date helper function
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

const StatCard = ({ icon: Icon, title, value, description, color = 'blue' }) => {
  const colors = {
    blue: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    green: 'text-green-500 bg-green-100 dark:bg-green-900/30',
    amber: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
    purple: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  };

  // Safely handle undefined values
  const displayValue = value ?? '0';
  const displayDescription = description ?? '';

  return (
    <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {displayValue}
          </p>
        </div>
        <div
          className={`p-3 rounded-full ${colors[color]} dark:bg-opacity-50`}
        >
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      {displayDescription && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {displayDescription}
        </p>
      )}
    </div>
  );
};

const QuickAction = ({ title, description, icon: Icon, to, color }) => {
  const colors = {
    blue: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    green: 'text-green-500 bg-green-100 dark:bg-green-900/30',
    amber: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
    purple: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  };

  return (
    <Link
      to={to}
      className="flex items-start p-4 transition-all bg-white rounded-lg shadow hover:shadow-md dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <div className={`p-2 mr-4 rounded-full ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </Link>
  );
};

const ReservationCard = ({ reservation }) => {
  if (!reservation) return null;
  
  const { resource, startTime, endTime } = reservation;
  const isActive = startTime && endTime && 
    new Date(startTime) <= new Date() && 
    new Date(endTime) >= new Date();

  return (
    <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {resource?.title || 'Unknown Resource'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {formatDate(startTime)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {startTime ? new Date(startTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }) : '--:--'}{' '}
            -{' '}
            {endTime ? new Date(endTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }) : '--:--'}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}
        >
          {isActive ? 'In Progress' : 'Upcoming'}
        </span>
      </div>
    </div>
  );
};

const HomePageContent = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [error, setError] = useState(null);
  
  const { 
    data: reservationsData, 
    isLoading: isReservationsLoading, 
    isError: isReservationsError,
    error: reservationsError,
    refetch: refetchReservations
  } = useGetUserReservationsQuery(undefined, {
    skip: isAuthLoading || !user,
    pollingInterval: 60000,
  });

  useEffect(() => {
    try {
      if (Array.isArray(reservationsData)) {
        const now = new Date();
        const upcoming = reservationsData
          .filter(res => res?.endTime && new Date(res.endTime) > now)
          .sort((a, b) => {
            try {
              return new Date(a?.startTime || 0) - new Date(b?.startTime || 0);
            } catch (e) {
              return 0;
            }
          })
          .slice(0, 3);
        setUpcomingReservations(upcoming);
        setError(null);
      }
    } catch (err) {
      console.error('Error processing reservations:', err);
      setError('Failed to process reservations');
    }
  }, [reservationsData]);

  const handleRetry = () => {
    refetchReservations();
  };


  if (isAuthLoading || isReservationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <h3 className="mb-2 text-lg font-medium text-red-600">
          An error occurred
        </h3>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          {error}
        </p>
        <Button onClick={handleRetry} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (isReservationsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <h3 className="mb-2 text-lg font-medium text-red-600">
          Failed to load reservations
        </h3>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          {reservationsError?.data?.message || 'An error occurred while loading your reservations'}
        </p>
        <Button onClick={handleRetry} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  const userName = user?.name?.split(' ')[0] || 'User';
  const isLoading = isReservationsLoading || isAuthLoading;

  return (
   <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {userName}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your library account today.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link to="/books">Browse Books</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/rooms">Book a Room</Link>
          </Button>
        </div>
      </div>
   {/* Stats Grid */}
      <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          title="Available Books"
          value="1,234"
          description="+12% from last month"
          color="blue"
        />
        <StatCard
          icon={Library}
          title="Reading Rooms"
          value="8"
          description="2 currently available"
          color="purple"
        />
        <StatCard
          icon={Users}
          title="Active Members"
          value="573"
          description="+8% from last month"
          color="green"
        />
        <StatCard
          icon={Clock}
          title="Your Reservations"
          value={reservationsData?.length?.toString() || '0'}
          description="Upcoming and active"
          color="amber"
        />
      </div>

      <div className="grid gap-6 mt-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <QuickAction
              title="Reserve a Book"
              description="Find and reserve books from our collection"
              icon={BookOpen}
              to="/books"
              color="blue"
            />
            <QuickAction
              title="Book a Study Room"
              description="Reserve a quiet space for studying"
              icon={Library}
              to="/rooms"
              color="purple"
            />
            <QuickAction
              title="View Reservations"
              description="Check your current and past reservations"
              icon={Clock}
              to="/reservations"
              color="amber"
            />
            {user?.role === 'librarian' && (
              <QuickAction
                title="Admin Dashboard"
                description="Manage books, rooms, and users"
                icon={Users}
                to="/admin"
                color="green"
              />
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Upcoming Reservations</h2>
            <Link
              to="/reservations"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin border-t-primary"></div>
              </div>
            ) : upcomingReservations.length > 0 ? (
              upcomingReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                />
              ))
            ) : (
              <div className="p-6 text-center bg-white rounded-lg shadow dark:bg-gray-800">
                <p className="text-gray-500 dark:text-gray-400">
                  No upcoming reservations
                </p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link to="/books">Reserve Now</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



const HomePage = () => (
  <ErrorBoundary>
    <HomePageContent />
  </ErrorBoundary>
);

export default HomePage;