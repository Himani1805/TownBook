import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const reservationsApi = createApi({
  reducerPath: 'reservationsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/reservations',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Reservation'],
  endpoints: (builder) => ({
    // Get all reservations for the current user
    getUserReservations: builder.query({
      query: () => ({
        url: '/me',
        method: 'GET',
      }),
      providesTags: ['Reservation'],
    }),
    
    // Get a single reservation by ID
    getReservationById: builder.query({
      query: (id) => ({
        url: `/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Reservation', id }],
    }),
    
    // Create a new reservation
    createReservation: builder.mutation({
      query: (reservationData) => ({
        url: '/',
        method: 'POST',
        body: reservationData,
      }),
      invalidatesTags: ['Reservation'],
    }),
    
    // Update a reservation
    updateReservation: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Reservation',
        { type: 'Reservation', id },
      ],
    }),
    
    // Cancel a reservation
    cancelReservation: builder.mutation({
      query: (id) => ({
        url: `/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'Reservation',
        { type: 'Reservation', id },
      ],
    }),
    
    // Get availability for a room
    getRoomAvailability: builder.query({
      query: ({ roomId, startDate, endDate }) => ({
        url: `/rooms/${roomId}/availability`,
        method: 'GET',
        params: { startDate, endDate },
      }),
    }),
    
    // Get user's upcoming reservations
    getUpcomingReservations: builder.query({
      query: () => ({
        url: '/me/upcoming',
        method: 'GET',
      }),
      providesTags: ['Reservation'],
    }),
    
    // Get user's past reservations
    getPastReservations: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: '/me/past',
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: ['Reservation'],
    }),
  }),
});

export const {
  useGetUserReservationsQuery,
  useGetReservationByIdQuery,
  useCreateReservationMutation,
  useUpdateReservationMutation,
  useCancelReservationMutation,
  useGetRoomAvailabilityQuery,
  useGetUpcomingReservationsQuery,
  useGetPastReservationsQuery,
  useGetReservationsQuery,
} = reservationsApi;
