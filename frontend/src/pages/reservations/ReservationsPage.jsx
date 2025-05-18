import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO, isBefore, isAfter, isToday } from 'date-fns';
import { Calendar, Clock, BookOpen, X, Check, AlertTriangle, Clock as ClockIcon } from 'lucide-react';
import { useGetUserReservationsQuery } from '@/features/reservations/reservationsApi';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loader2 } from 'lucide-react';

export const ReservationsPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { data: reservations, isLoading, isError, error } = useGetUserReservationsQuery();
  
  // Filter reservations based on active tab
  const filterReservations = () => {
    if (!reservations) return [];
    
    const now = new Date();
    
    return reservations.filter(reservation => {
      const startTime = parseISO(reservation.startTime);
      const endTime = parseISO(reservation.endTime);
      
      if (activeTab === 'upcoming') {
        return isAfter(endTime, now);
      } else if (activeTab === 'past') {
        return isBefore(endTime, now);
      } else if (activeTab === 'today') {
        return isToday(startTime);
      }
      
      return true;
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  };
  
  const filteredReservations = filterReservations();
  
  const getReservationStatus = (reservation) => {
    const now = new Date();
    const startTime = parseISO(reservation.startTime);
    const endTime = parseISO(reservation.endTime);
    
    if (reservation.status === 'cancelled') {
      return {
        variant: 'destructive',
        label: 'Cancelled',
        icon: X,
      };
    }
    
    if (isBefore(now, startTime)) {
      return {
        variant: 'warning',
        label: 'Upcoming',
        icon: ClockIcon,
      };
    }
    
    if (isAfter(now, endTime)) {
      return {
        variant: 'success',
        label: 'Completed',
        icon: Check,
      };
    }
    
    return {
      variant: 'info',
      label: 'In Progress',
      icon: AlertTriangle,
    };
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 mr-2 animate-spin" />
        <span>Loading your reservations...</span>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded-md">
        Error loading reservations: {error?.data?.message || 'Unknown error'}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Reservations</h1>
        <p className="text-muted-foreground">
          View and manage your room and book reservations
        </p>
      </div>
      
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Upcoming
            {reservations?.some(r => isAfter(parseISO(r.endTime), new Date())) && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                {reservations.filter(r => isAfter(parseISO(r.endTime), new Date())).length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('today')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'today'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Today
          </button>
          
          <button
            onClick={() => setActiveTab('past')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'past'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Past
          </button>
        </nav>
      </div>
      
      {filteredReservations.length > 0 ? (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => {
            const status = getReservationStatus(reservation);
            const Icon = status.icon;
            const isRoom = reservation.type === 'room';
            
            return (
              <div
                key={reservation.id}
                className="flex flex-col p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 sm:flex-row sm:items-center"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  {isRoom ? (
                    <Clock className="w-6 h-6 text-primary-600 dark:text-primary-300" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-300" />
                  )}
                </div>
                
                <div className="mt-3 sm:mt-0 sm:ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {isRoom ? reservation.room?.name : reservation.book?.title}
                    </h3>
                    <Badge variant={status.variant} className="ml-2">
                      <Icon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isRoom ? 'Reading Room' : 'Book'}
                    {reservation.room?.location ? ` • ${reservation.room.location}` : ''}
                  </p>
                  
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      <span>{format(parseISO(reservation.startTime), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1.5" />
                      <span>
                        {format(parseISO(reservation.startTime), 'h:mm a')} -{' '}
                        {format(parseISO(reservation.endTime), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                  
                  {reservation.notes && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Notes:</span> {reservation.notes}
                    </p>
                  )}
                </div>
                
                <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center space-x-2">
                  {status.label === 'Upcoming' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-900/30"
                      onClick={() => {
                        // Handle cancel reservation
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link to={isRoom ? `/rooms/${reservation.room?.id}` : `/books/${reservation.book?.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No {activeTab} reservations
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {activeTab === 'upcoming'
              ? "You don't have any upcoming reservations. Book a room or reserve a book to get started."
              : activeTab === 'today'
              ? "You don't have any reservations for today. Check upcoming reservations or book a room now."
              : "You don't have any past reservations. Your reservation history will appear here."}
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link to={activeTab === 'past' ? '/rooms' : '/rooms'}>
                {activeTab === 'past' ? 'Browse Rooms' : 'Book a Room'}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
