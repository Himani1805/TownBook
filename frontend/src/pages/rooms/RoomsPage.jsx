import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, Filter, Clock, Users, Loader2, Plus } from 'lucide-react';
import { useGetRoomsQuery } from '@/features/rooms/roomsApi';
import { RoomCard } from '@/components/rooms/RoomCard';

export const RoomsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    capacity: '',
    status: 'available',
    sort: 'name_asc',
  });

  const { data: roomsData, isLoading, isError, error } = useGetRoomsQuery();
  
  const [filteredRooms, setFilteredRooms] = useState([]);

  useEffect(() => {
    if (roomsData) {
      let result = [...roomsData];
      
      // Apply search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(
          (room) =>
            room.name.toLowerCase().includes(term) ||
            room.location?.toLowerCase().includes(term) ||
            room.description?.toLowerCase().includes(term)
        );
      }

      // Apply filters
      if (filters.capacity) {
        result = result.filter((room) => room.capacity >= parseInt(filters.capacity));
      }

      if (filters.status === 'available') {
        const now = new Date();
        result = result.filter((room) => {
          // Check if room has any active bookings
          const hasActiveBooking = room.bookings?.some(
            (booking) => new Date(booking.endTime) > now
          );
          return !hasActiveBooking;
        });
      }

      // Apply sorting
      result.sort((a, b) => {
        switch (filters.sort) {
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'name_desc':
            return b.name.localeCompare(a.name);
          case 'capacity_asc':
            return a.capacity - b.capacity;
          case 'capacity_desc':
            return b.capacity - a.capacity;
          default:
            return 0;
        }
      });

      setFilteredRooms(result);
    }
  }, [roomsData, searchTerm, filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 mr-2 animate-spin" />
        <span>Loading reading rooms...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded-md">
        Error loading reading rooms: {error?.data?.message || 'Unknown error'}
      </div>
    );
  }

  // Extract unique capacities for filter
  const capacities = [...new Set(roomsData?.map((room) => room.capacity).sort((a, b) => a - b))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reading Rooms</h1>
          <p className="text-muted-foreground">
            Reserve a quiet space for reading and studying
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link to="/rooms/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search rooms by name, location, or description..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.capacity}
              onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
            >
              <option value="">Any Capacity</option>
              {capacities.map((capacity) => (
                <option key={capacity} value={capacity}>
                  {capacity}+ people
                </option>
              ))}
            </select>
            
            <select
              className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Rooms</option>
              <option value="available">Available Now</option>
            </select>
            
            <select
              className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            >
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="capacity_asc">Capacity (Low to High)</option>
              <option value="capacity_desc">Capacity (High to Low)</option>
            </select>
          </div>
        </div>

        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-lg shadow dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No reading rooms found
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilters({
                    capacity: '',
                    status: 'available',
                    sort: 'name_asc',
                  });
                }}
              >
                Clear filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
