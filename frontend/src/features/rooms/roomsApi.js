import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const roomsApi = createApi({
  reducerPath: 'roomsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/rooms',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Room'],
  endpoints: (builder) => ({
    getRooms: builder.query({
      query: () => ({
        url: '/',
        method: 'GET',
      }),
      providesTags: ['Room'],
    }),
    getRoomById: builder.query({
      query: (id) => ({
        url: `/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Room', id }],
    }),
    addRoom: builder.mutation({
      query: (roomData) => ({
        url: '/',
        method: 'POST',
        body: roomData,
      }),
      invalidatesTags: ['Room'],
    }),
    updateRoom: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Room',
        { type: 'Room', id },
      ],
    }),
    deleteRoom: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Room'],
    }),
    bookRoom: builder.mutation({
      query: ({ roomId, startTime, endTime, notes = '' }) => ({
        url: `/${roomId}/bookings`,
        method: 'POST',
        body: { startTime, endTime, notes },
      }),
      invalidatesTags: ['Room'],
    }),
    cancelBooking: builder.mutation({
      query: ({ roomId, bookingId }) => ({
        url: `/${roomId}/bookings/${bookingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Room'],
    }),
    getRoomAvailability: builder.query({
      query: ({ roomId, startDate, endDate }) => ({
        url: `/${roomId}/availability`,
        method: 'GET',
        params: { startDate, endDate },
      }),
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useGetRoomByIdQuery,
  useAddRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useBookRoomMutation,
  useCancelBookingMutation,
  useGetRoomAvailabilityQuery,
} = roomsApi;
