import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format, addHours, isBefore, isAfter, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Users, MapPin, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useGetRoomByIdQuery, useBookRoomMutation } from '@/features/rooms/roomsApi';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { cn } from '@/lib/utils';

// Time slots for room booking (9 AM to 8 PM)
const TIME_SLOTS = Array.from({ length: 12 }, (_, i) => {
  const hour = i + 9; // 9 AM to 8 PM
  return {
    value: `${hour.toString().padStart(2, '0')}:00`,
    label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
  };
});

export const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  
  const { data: room, isLoading, isError, error } = useGetRoomByIdQuery(id);
  const [bookRoom] = useBookRoomMutation();
  
  // Filter out unavailable time slots based on existing bookings
  const getAvailableTimeSlots = () => {
    if (!room || !room.bookings) return TIME_SLOTS;
    
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const todayBookings = room.bookings.filter(booking => {
      const bookingDate = booking.startTime.split('T')[0];
      return bookingDate === selectedDateStr;
    });
    
    return TIME_SLOTS.filter(timeSlot => {
      const slotStart = new Date(`${selectedDateStr}T${timeSlot.value}`);
      const slotEnd = addHours(slotStart, 1);
      
      // Check if this time slot overlaps with any existing booking
      return !todayBookings.some(booking => {
        const bookingStart = parseISO(booking.startTime);
        const bookingEnd = parseISO(booking.endTime);
        
        return (
          (isAfter(slotStart, bookingStart) && isBefore(slotStart, bookingEnd)) ||
          (isAfter(bookingStart, slotStart) && isBefore(bookingStart, slotEnd)) ||
          (isBefore(bookingStart, slotStart) && isAfter(bookingEnd, slotEnd))
        );
      });
    });
  };
  
  const availableTimeSlots = getAvailableTimeSlots();
  const isTimeSlotAvailable = availableTimeSlots.some(slot => slot.value === startTime);
  
  const handleBookRoom = async () => {
    if (!isTimeSlotAvailable) {
      toast({
        title: 'Time slot not available',
        description: 'The selected time slot is no longer available. Please choose another time.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsBooking(true);
      const startDateTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${startTime}`);
      const endDateTime = addHours(startDateTime, 1);
      
      await bookRoom({
        roomId: id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        notes,
      }).unwrap();
      
      toast({
        title: 'Booking confirmed!',
        description: `You have successfully booked ${room.name} from ${format(startDateTime, 'h:mm a')} to ${format(endDateTime, 'h:mm a')} on ${format(selectedDate, 'MMMM d, yyyy')}.`,
      });
      
      // Redirect to bookings page
      navigate('/my-bookings');
    } catch (err) {
      toast({
        title: 'Booking failed',
        description: err?.data?.message || 'Failed to book the room. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 mr-2 animate-spin" />
        <span>Loading room details...</span>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded-md">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Error loading room: {error?.data?.message || 'Room not found'}</span>
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/rooms')}
        >
          Back to Rooms
        </Button>
      </div>
    );
  }
  
  if (!room) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold">Room not found</h2>
        <p className="mt-2 text-gray-600">The requested room could not be found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/rooms')}
        >
          Back to Rooms
        </Button>
      </div>
    );
  }
  
  // Check if the selected time slot is available
  const isSelectedTimeAvailable = isTimeSlotAvailable;
  
  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Rooms
        </Button>
        
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Room Image and Info */}
          <div className="w-full md:w-1/2 lg:w-2/3">
            <div className="overflow-hidden rounded-lg">
              {room.image ? (
                <img
                  src={room.image}
                  alt={room.name}
                  className="object-cover w-full h-64 md:h-96 rounded-lg"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-64 bg-gray-100 rounded-lg md:h-96 dark:bg-gray-700">
                  <MapPin className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {room.name}
                  </h1>
                  {room.location && (
                    <div className="flex items-center mt-1 text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-1.5" />
                      <span>{room.location}</span>
                    </div>
                  )}
                </div>
                <Badge variant={isSelectedTimeAvailable ? 'success' : 'warning'}>
                  {isSelectedTimeAvailable ? 'Available' : 'Booked'}
                </Badge>
              </div>
              
              {room.description && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium">Description</h3>
                  <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {room.description}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2">
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Capacity
                  </h4>
                  <div className="flex items-center mt-1">
                    <Users className="w-5 h-5 mr-2 text-gray-400" />
                    <span>{room.capacity} {room.capacity === 1 ? 'person' : 'people'}</span>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Availability
                  </h4>
                  <div className="flex items-center mt-1">
                    <Clock className="w-5 h-5 mr-2 text-gray-400" />
                    <span>{isSelectedTimeAvailable ? 'Available now' : 'Check availability'}</span>
                  </div>
                </div>
              </div>
              
              {room.amenities && room.amenities.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium">Amenities</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {room.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="font-normal">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Booking Form */}
          <div className="w-full p-6 bg-white border rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 md:w-1/2 lg:w-1/3 h-fit">
            <h2 className="text-xl font-semibold">Book This Room</h2>
            <p className="mt-1 text-sm text-gray-500">
              Select a date and time for your booking
            </p>
            
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal mt-1',
                        !selectedDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {selectedDate ? (
                        format(selectedDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      disabled={(date) => {
                        // Disable past dates
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Time
                  </label>
                  <select
                    className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  >
                    {availableTimeSlots.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Duration
                  </label>
                  <select
                    className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled // Fixed 1-hour duration for now
                  >
                    <option value="1">1 hour</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Any special requests or requirements?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <div className="pt-2">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBookRoom}
                  disabled={!isSelectedTimeAvailable || isBooking}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Book Now'
                  )}
                </Button>
                
                {!isSelectedTimeAvailable && (
                  <p className="mt-2 text-sm text-center text-red-500">
                    The selected time slot is not available. Please choose another time.
                  </p>
                )}
              </div>
              
              <div className="p-4 mt-4 text-sm text-gray-600 bg-blue-50 rounded-md dark:bg-blue-900/30 dark:text-blue-200">
                <h4 className="font-medium">Booking Information</h4>
                <ul className="mt-2 space-y-1">
                  <li className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Date:</span>
                    <span>{format(selectedDate, 'MMMM d, yyyy')}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Time:</span>
                    <span>
                      {startTime} - {format(addHours(new Date(`2000-01-01T${startTime}`), 1), 'HH:mm')}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                    <span>1 hour</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
