import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Clock, Users, MapPin, Calendar } from 'lucide-react';

export const RoomCard = ({ room }) => {
  const {
    id,
    name,
    location,
    description,
    capacity,
    image,
    amenities = [],
    bookings = [],
  } = room;

  // Check if room is currently available
  const isAvailable = () => {
    const now = new Date();
    return !bookings.some(
      (booking) => new Date(booking.endTime) > now
    );
  };

  // Get next available time slot
  const getNextAvailableTime = () => {
    const now = new Date();
    const activeBookings = bookings
      .filter((booking) => new Date(booking.endTime) > now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    return activeBookings.length > 0 ? new Date(activeBookings[0].endTime) : null;
  };

  const available = isAvailable();
  const nextAvailable = getNextAvailableTime();
  const availableTime = nextAvailable
    ? new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(nextAvailable)
    : null;

  return (
    <div className="overflow-hidden transition-all duration-200 bg-white border rounded-lg shadow-sm group dark:bg-gray-800 dark:border-gray-700 hover:shadow-md">
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
        {image ? (
          <img
            src={image}
            alt={name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            <MapPin className="w-12 h-12" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <h3 className="text-lg font-semibold text-white">{name}</h3>
          {location && (
            <p className="text-sm text-gray-200 truncate">
              <MapPin className="inline w-3 h-3 mr-1" />
              {location}
            </p>
          )}
        </div>
      </div>

      <div className="p-4">
        {description && (
          <p className="mb-4 text-sm text-gray-600 line-clamp-3 dark:text-gray-300">
            {description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {capacity} {capacity === 1 ? 'person' : 'people'}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {available ? 'Available now' : `Available at ${availableTime}`}
            </span>
          </div>
        </div>

        {amenities.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 text-xs font-medium tracking-wider text-gray-500 uppercase">
              Amenities
            </h4>
            <div className="flex flex-wrap gap-2">
              {amenities.slice(0, 3).map((amenity, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs font-normal"
                >
                  {amenity}
                </Badge>
              ))}
              {amenities.length > 3 && (
                <Badge variant="outline" className="text-xs font-normal">
                  +{amenities.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <Badge variant={available ? 'success' : 'warning'} className="px-2.5 py-1 text-xs">
            {available ? 'Available' : 'Booked'}
          </Badge>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/rooms/${id}`}>View Details</Link>
            </Button>
            <Button
              size="sm"
              disabled={!available}
              className={!available ? 'opacity-50' : ''}
              asChild={available}
            >
              <Link to={available ? `/rooms/${id}/book` : '#'}>
                {available ? 'Book Now' : 'Unavailable'}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
