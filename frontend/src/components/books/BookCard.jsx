import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, Clock, User, Calendar, Bookmark } from 'lucide-react';

export const BookCard = ({ book }) => {
  const {
    id,
    title,
    author,
    coverImage,
    genre,
    publishedYear,
    availableCopies,
    totalCopies,
  } = book;

  const availabilityPercentage = Math.round((availableCopies / totalCopies) * 100);
  const isAvailable = availableCopies > 0;

  return (
    <div className="overflow-hidden transition-all duration-200 bg-white border rounded-lg shadow-sm group dark:bg-gray-800 dark:border-gray-700 hover:shadow-md">
      <div className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 overflow-hidden rounded-md">
            {coverImage ? (
              <img
                src={coverImage}
                alt={`${title} cover`}
                className="object-cover w-24 h-32"
              />
            ) : (
              <div className="flex items-center justify-center w-24 h-32 bg-gray-100 dark:bg-gray-700">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate dark:text-white">
              <Link to={`/books/${id}`} className="hover:underline">
                {title}
              </Link>
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">by {author}</p>
            
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Bookmark className="flex-shrink-0 w-4 h-4 mr-1.5" />
                <span className="truncate">{genre || 'No genre'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="flex-shrink-0 w-4 h-4 mr-1.5" />
                <span>{publishedYear || 'N/A'}</span>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Availability
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {availableCopies} of {totalCopies} available
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
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
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <Badge
            variant={isAvailable ? 'success' : 'destructive'}
            className="px-2.5 py-1 text-xs"
          >
            {isAvailable ? 'Available' : 'Out of Stock'}
          </Badge>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              asChild={isAvailable}
              disabled={!isAvailable}
            >
              <Link to={isAvailable ? `/books/${id}/reserve` : '#'}>
                {isAvailable ? 'Reserve' : 'Unavailable'}
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/books/${id}`}>
                <span className="sr-only">View details</span>
                <span>Details</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
