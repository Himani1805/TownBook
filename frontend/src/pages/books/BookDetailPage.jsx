import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetBookByIdQuery, useReserveBookMutation } from '@/features/books/booksApi';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Calendar, BookOpen, User, Bookmark, Clock, AlertCircle } from 'lucide-react';

export const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isReserving, setIsReserving] = useState(false);
  
  const { data: book, isLoading, isError, error } = useGetBookByIdQuery(id);
  const [reserveBook] = useReserveBookMutation();
  
  const handleReserve = async () => {
    if (!book) return;
    
    try {
      setIsReserving(true);
      await reserveBook(book.id).unwrap();
      
      toast({
        title: 'Reservation Successful',
        description: `You have successfully reserved "${book.title}". Please pick it up within 24 hours.`,
        variant: 'default',
      });
      
      // Redirect to reservations page or show success state
      navigate('/reservations');
    } catch (err) {
      toast({
        title: 'Reservation Failed',
        description: err?.data?.message || 'Failed to reserve the book. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsReserving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 mr-2 animate-spin" />
        <span>Loading book details...</span>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded-md">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Error loading book: {error?.data?.message || 'Book not found'}</span>
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/books')}
        >
          Back to Books
        </Button>
      </div>
    );
  }
  
  if (!book) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold">Book not found</h2>
        <p className="mt-2 text-gray-600">The requested book could not be found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/books')}
        >
          Back to Books
        </Button>
      </div>
    );
  }
  
  const isAvailable = book.availableCopies > 0;
  const availabilityPercentage = Math.round((book.availableCopies / book.totalCopies) * 100);
  
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
          Back to Books
        </Button>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Book Cover */}
          <div className="flex-shrink-0 w-full md:w-1/3 lg:w-1/4">
            <div className="overflow-hidden rounded-lg shadow">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={`${book.title} cover`}
                  className="object-cover w-full h-auto aspect-[2/3]"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100 aspect-[2/3] dark:bg-gray-700">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <Button
                className="w-full"
                disabled={!isAvailable || isReserving}
                onClick={handleReserve}
              >
                {isReserving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : isAvailable ? (
                  'Reserve This Book'
                ) : (
                  'Not Available for Reservation'
                )}
              </Button>
              
              <div className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
                {isAvailable ? (
                  <p>Usually available for pickup within 24 hours</p>
                ) : (
                  <p>Check back later for availability</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Book Details */}
          <div className="flex-1">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {book.title}
                  </h1>
                  <p className="mt-1 text-xl text-gray-600 dark:text-gray-300">
                    by {book.author}
                  </p>
                </div>
                <Badge
                  variant={isAvailable ? 'success' : 'destructive'}
                  className="px-3 py-1.5 text-sm"
                >
                  {isAvailable ? 'Available' : 'Out of Stock'}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {book.genre && (
                  <Badge variant="secondary" className="text-sm">
                    {book.genre}
                  </Badge>
                )}
                {book.publishedYear && (
                  <Badge variant="outline" className="text-sm">
                    Published: {book.publishedYear}
                  </Badge>
                )}
                {book.isbn && (
                  <Badge variant="outline" className="text-sm">
                    ISBN: {book.isbn}
                  </Badge>
                )}
              </div>
              
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Availability</h3>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {book.availableCopies} of {book.totalCopies} copies available
                      </span>
                      <span className="text-sm text-gray-500">
                        {availabilityPercentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                      <div
                        className={`h-2 rounded-full ${
                          availabilityPercentage > 75
                            ? 'bg-green-500'
                            : availabilityPercentage > 25
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.max(5, availabilityPercentage)}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Publisher
                    </h4>
                    <p className="mt-1">
                      {book.publisher || 'Not specified'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Pages
                    </h4>
                    <p className="mt-1">
                      {book.pages ? `${book.pages} pages` : 'Not specified'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Language
                    </h4>
                    <p className="mt-1">
                      {book.language || 'Not specified'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Format
                    </h4>
                    <p className="mt-1">
                      {book.format || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
              
              {book.description && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium">Description</h3>
                  <div className="mt-2 prose dark:prose-invert">
                    <p className="whitespace-pre-line">{book.description}</p>
                  </div>
                </div>
              )}
              
              <div className="pt-6 mt-auto">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant={isAvailable ? 'default' : 'outline'}
                    size="lg"
                    disabled={!isAvailable || isReserving}
                    onClick={handleReserve}
                    className="flex-1 min-w-[200px]"
                  >
                    {isReserving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isAvailable ? (
                      'Reserve This Book'
                    ) : (
                      'Not Available for Reservation'
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 min-w-[200px]"
                    onClick={() => {
                      // Add to wishlist functionality
                      toast({
                        title: 'Added to Wishlist',
                        description: `${book.title} has been added to your wishlist.`,
                      });
                    }}
                  >
                    Add to Wishlist
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
