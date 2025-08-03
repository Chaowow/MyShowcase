import React from 'react';
import MediaCard from './MediaCard';
import placeholder from '../assets/placeholder.jpg'


function SearchResults({ searchResults, onOpenModal, currentPage, totalPages, setCurrentPage, selectedCategory, isLoading }) {

  const SkeletonCard = () => (
    <div className='bg-indigo-900/75 sm:p-6 rounded shadow flex flex-col items-center text-center animate-pulse'>

      {/* Image Skeleton */}
      <div className='w-32 sm:w-40 md:w-60 h-44 sm:h-60 md:h-64 lg:h-72 bg-slate-600 mb-2 rounded' />

      {/* Title Skeleton */}
      <div className='h-5 w-2/3 bg-slate-600 rounded mb-2' />

      {/* Subtitle Skeleton */}
      <div className='h-4 w-1/3 bg-slate-600 rounded mb-2' />

      {/* Description Skeleton */}
      <div className='h-3 w-3/4 bg-slate-600 rounded mb-1' />
      <div className='h-3 w-5/6 bg-slate-600 rounded mb-1' />
      <div className='h-3 w-2/3 bg-slate-600 rounded mb-3' />

      {/* Button Skeleton */}
      <div className='h-10 w-full bg-indigo-600/75 rounded' />
    </div>
  );

  return (
    <div>
      {isLoading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6'>
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>

      ) : searchResults ? (

        <>
          <h3 className='text-2xl text-white mb-4'>Search Results:</h3>
          {searchResults.length === 0 ? (
            <p className='text-slate-300'>No results found.</p>

          ) : (

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6'>
              {searchResults.map((item) => {
                if (selectedCategory === 'movies') {

                  return (
                    <MediaCard
                      key={item.id}
                      imageSrc={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : placeholder}
                      alt={item.title}
                      title={item.title}
                      subtitle={item.release_date ? new Date(item.release_date).getFullYear() : 'Year not available'}
                      description={item.overview}
                      onAdd={() => onOpenModal(item)}
                    />
                  );
                } else if (selectedCategory === 'books') {

                  if (!item || !item.volumeInfo) return null;
                  return (
                    <MediaCard
                      key={item.id}
                      imageSrc={item.volumeInfo.imageLinks?.thumbnail ? item.volumeInfo.imageLinks.thumbnail : placeholder}
                      alt={item.volumeInfo.title}
                      title={item.volumeInfo.title}
                      subtitle={item.volumeInfo.authors
                        ? item.volumeInfo.authors.join(', ')
                        : 'Author not available'
                      }
                      description={item.volumeInfo.description}
                      onAdd={() => onOpenModal(item)}
                    />
                  );
                } else if (selectedCategory === 'tvShows') {

                  return (
                    <MediaCard
                      key={item.id}
                      imageSrc={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : placeholder}
                      alt={item.name}
                      title={item.name}
                      subtitle={item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'Year not available'}
                      description={item.overview}
                      onAdd={() => onOpenModal(item)}
                    />
                  );
                } else if (selectedCategory === 'videoGames') {

                  if (!item || !item.name) return null;
                  return (
                    <MediaCard
                      key={item.id}
                      imageSrc={item.background_image ? item.background_image : placeholder}
                      alt={item.name}
                      title={item.name}
                      subtitle={item.released ? new Date(item.released).getFullYear() : 'Year not available'}
                      platforms={item.platforms && item.platforms.length > 0
                        ? item.platforms.join(', ')
                        : null
                      }
                      onAdd={() => onOpenModal(item)}
                    />
                  );
                }

                return null;
              })}
            </div>
          )}

          {/* Pagination */}
          <div className='flex justify-center items-center mt-4 space-x-6'>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 text-white'}`}
            >
              Previous
            </button>
            <span className='text-white'>{`${currentPage} of ${totalPages}`}</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 w-24 rounded ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 text-white'}`}
            >
              Next
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default SearchResults;