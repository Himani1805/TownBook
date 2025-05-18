import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUpdateProfileMutation, useChangePasswordMutation } from '@/features/auth/authApi';
import { useGetUserReservationsQuery } from '@/features/reservations/reservationsApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Lock, Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

// Form validation schemas
const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, { message: 'Current password is required' }),
  newPassword: z.string().min(8, { message: 'New password must be at least 8 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const ProfilePage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Fetch user data and reservations
  const { data: reservationsData } = useGetUserReservationsQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  
  // Profile form
  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors }, reset } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  });
  
  // Password form
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm({
    resolver: zodResolver(passwordSchema),
  });
  
  // Handle profile update
  const onProfileSubmit = async (data) => {
    try {
      await updateProfile(data).unwrap();
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err?.data?.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle password change
  const onPasswordSubmit = async (data) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();
      
      toast({
        title: 'Password changed',
        description: 'Your password has been updated successfully.',
      });
      resetPassword();
    } catch (err) {
      toast({
        title: 'Password change failed',
        description: err?.data?.message || 'Failed to change password. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Get upcoming reservations
  const upcomingReservations = reservationsData?.filter(reservation => {
    const endTime = new Date(reservation.endTime);
    return endTime > new Date();
  }).slice(0, 3) || [];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and view your reservations
        </p>
      </div>
      
      <Tabs 
        defaultValue="profile" 
        className="space-y-6"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="reservations">My Reservations</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className={`pl-10 ${profileErrors.name ? 'border-red-500' : ''}`}
                      {...registerProfile('name')}
                    />
                  </div>
                  {profileErrors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {profileErrors.name.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className={`pl-10 ${profileErrors.email ? 'border-red-500' : ''}`}
                      {...registerProfile('email')}
                    />
                  </div>
                  {profileErrors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {profileErrors.email.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(123) 456-7890"
                    className={profileErrors.phone ? 'border-red-500' : ''}
                    {...registerProfile('phone')}
                  />
                  {profileErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {profileErrors.phone.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <Input
                    id="address"
                    placeholder="123 Main St, City, State ZIP"
                    className={profileErrors.address ? 'border-red-500' : ''}
                    {...registerProfile('address')}
                  />
                  {profileErrors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {profileErrors.address.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Enter your current password"
                      className={`pl-10 ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                      {...registerPassword('currentPassword')}
                    />
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter your new password"
                      className={`pl-10 ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                      {...registerPassword('newPassword')}
                    />
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your new password"
                      className={`pl-10 ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                      {...registerPassword('confirmPassword')}
                    />
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        {/* Reservations Tab */}
        <TabsContent value="reservations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Reservations</CardTitle>
              <CardDescription>
                Your upcoming room and book reservations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingReservations.length > 0 ? (
                <div className="space-y-4">
                  {upcomingReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex flex-col p-4 border rounded-lg sm:flex-row sm:items-center"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        {reservation.type === 'room' ? (
                          <Clock className="w-6 h-6 text-primary-600 dark:text-primary-300" />
                        ) : (
                          <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-300" />
                        )}
                      </div>
                      
                      <div className="mt-3 sm:mt-0 sm:ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {reservation.type === 'room' ? reservation.room?.name : reservation.book?.title}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {reservation.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {reservation.type === 'room' ? 'Reading Room' : 'Book'}
                          {reservation.room?.location ? ` • ${reservation.room.location}` : ''}
                        </p>
                        
                        <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5" />
                            <span>{format(new Date(reservation.startTime), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1.5" />
                            <span>
                              {format(new Date(reservation.startTime), 'h:mm a')} -{' '}
                              {format(new Date(reservation.endTime), 'h:mm a')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 sm:mt-0 sm:ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link to={reservation.type === 'room' ? `/rooms/${reservation.room?.id}` : `/books/${reservation.book?.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {reservationsData?.length > 3 && (
                    <div className="mt-4 text-center">
                      <Button variant="link" asChild>
                        <Link to="/my-reservations">
                          View all reservations
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    No upcoming reservations
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    You don't have any upcoming reservations. Book a room or reserve a book to get started.
                  </p>
                  <div className="mt-6">
                    <Button asChild>
                      <Link to="/rooms">
                        Book a Room
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
