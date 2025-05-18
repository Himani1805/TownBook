import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const booksApi = createApi({
  reducerPath: 'booksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/books',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Book'],
  endpoints: (builder) => ({
    getBooks: builder.query({
      query: () => ({
        url: '/',
        method: 'GET',
      }),
      providesTags: ['Book'],
    }),
    getBookById: builder.query({
      query: (id) => ({
        url: `/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Book', id }],
    }),
    addBook: builder.mutation({
      query: (bookData) => ({
        url: '/',
        method: 'POST',
        body: bookData,
      }),
      invalidatesTags: ['Book'],
    }),
    updateBook: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Book',
        { type: 'Book', id },
      ],
    }),
    deleteBook: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Book'],
    }),
    reserveBook: builder.mutation({
      query: (id) => ({
        url: `/${id}/reserve`,
        method: 'POST',
      }),
      invalidatesTags: ['Book'],
    }),
    cancelReservation: builder.mutation({
      query: (id) => ({
        url: `/${id}/cancel-reservation`,
        method: 'POST',
      }),
      invalidatesTags: ['Book'],
    }),
  }),
});

export const {
  useGetBooksQuery,
  useGetBookByIdQuery,
  useAddBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useReserveBookMutation,
  useCancelReservationMutation,
} = booksApi;
