import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';
import { useGetBooksQuery } from '@/features/books/booksApi';
import { BookCard } from '@/components/books/BookCard';

export const BooksPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    status: 'available',
    sort: 'title_asc',
  });

  const { data: booksData, isLoading, isError, error } = useGetBooksQuery();
  
  const [filteredBooks, setFilteredBooks] = useState([]);

  useEffect(() => {
    if (booksData) {
      let result = [...booksData];
      
      // Apply search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(
          (book) =>
            book.title.toLowerCase().includes(term) ||
            book.author.toLowerCase().includes(term) ||
            book.isbn?.toLowerCase().includes(term)
        );
      }

      // Apply filters
      if (filters.genre) {
        result = result.filter((book) => book.genre === filters.genre);
      }

      if (filters.status === 'available') {
        result = result.filter((book) => book.availableCopies > 0);
      }

      // Apply sorting
      result.sort((a, b) => {
        switch (filters.sort) {
          case 'title_asc':
            return a.title.localeCompare(b.title);
          case 'title_desc':
            return b.title.localeCompare(a.title);
          case 'author_asc':
            return a.author.localeCompare(b.author);
          case 'published_desc':
            return new Date(b.publishedDate) - new Date(a.publishedDate);
          default:
            return 0;
        }
      });

      setFilteredBooks(result);
    }
  }, [booksData, searchTerm, filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 mr-2 animate-spin" />
        <span>Loading books...</span>
      </div>
    );
  }


  if (isError) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded-md">
        Error loading books: {error?.data?.message || 'Unknown error'}
      </div>
    );
  }

  // Extract unique genres for filter
  const genres = [...new Set(booksData?.map((book) => book.genre).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Book Catalog</h1>
          <p className="text-muted-foreground">
            Browse and reserve books from our collection
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link to="/books/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Book
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
              placeholder="Search books by title, author, or ISBN..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.genre}
              onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
            
            <select
              className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Books</option>
              <option value="available">Available Only</option>
            </select>
            
            <select
              className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            >
              <option value="title_asc">Title (A-Z)</option>
              <option value="title_desc">Title (Z-A)</option>
              <option value="author_asc">Author (A-Z)</option>
              <option value="published_desc">Newest First</option>
            </select>
          </div>
        </div>

        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-lg shadow dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No books found
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
                    genre: '',
                    status: 'available',
                    sort: 'title_asc',
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
