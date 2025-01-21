import React from 'react';

function SearchResults({ searchResults, onOpenModal, currentPage, totalPages, setCurrentPage, selectedCategory }) {
    return (
        <div>
          {searchResults ? (
            <>
              <h3 className='text-2xl text-white mb-4'>Search Results:</h3>
              {searchResults.length === 0 ? (
                <p className='text-slate-300'>No results found.</p>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6'>
                  {searchResults.map((item) => {
                    if (selectedCategory === 'movies') {
                  
                      return (
                        <div key={item.id} className='bg-indigo-900/75 sm:p-6 rounded shadow flex flex-col'>

                          {/* Poster */}
                          {item.poster_path && (
                            <img
                              src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                              alt={item.title}
                              className="w-32 sm:w-40 md:w-64 h-auto mb-2 rounded"
                            />
                          )}

                          {/* Title */}
                          <h4 className="text-xl font-semibold text-slate-100">
                            {item.title}
                          </h4>

                          {/* Release Year */}
                          <h5 className="text-sm text-slate-300 mb-2">
                            {item.release_date
                              ? new Date(item.release_date).getFullYear()
                              : 'Year not available'}
                          </h5>

                          {/* Overview */}
                          <p className="text-sm text-slate-400 flex-1">
                            {item.overview}
                          </p>
                          <button
                            onClick={() => onOpenModal(item)}
                            className='bg-indigo-500 px-4 py-2 rounded text-white hover:bg-indigo-600 mt-4 w-full'
                          >
                            Add to List
                          </button>
                        </div>
                      );
                    } else if (selectedCategory === 'books') {
        
                      return (
                        <div key={item.id} className='bg-indigo-900/75 sm:p-6 rounded shadow flex flex-col'>

                          {/* Book Cover */}
                          {item.volumeInfo?.imageLinks?.thumbnail && (
                            <img
                              src={item.volumeInfo.imageLinks.thumbnail}
                              alt={item.volumeInfo.title}
                              className="w-40 sm:w-60 object-cover mb-2 rounded"
                            />
                          )}

                          {/* Title */}
                          <h4 className="text-xl font-semibold text-slate-100">
                            {item.volumeInfo?.title}
                          </h4>

                          {/* Authors */}
                          <p className="text-sm text-slate-300 mb-2">
                            {item.volumeInfo?.authors
                              ? item.volumeInfo.authors.join(', ')
                              : 'Author not available'}
                          </p>

                          {/* Description */}
                          <p className="text-sm text-slate-400 flex-1 line-clamp-6">
                            {item.volumeInfo?.description || 'No description'}
                          </p>
                        </div>
                      );
                    } else if (selectedCategory === 'tvShows') {

                      return (
                        <div key={item.id} className='bg-indigo-900/75 sm:p-6 rounded shadow flex flex-col'>

                          {/* Tv Show Cover */}
                          {item.poster_path && (
                            <img 
                              src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                              alt={item.name}
                              className="w-32 sm:w-40 md:w-64 h-auto mb-2 rounded"
                              />
                          )}

                          {/* Title */}
                          <h4 className="text-xl font-semibold text-slate-100">
                            {item.name}
                          </h4>

                          {/* Air Date */}
                          <h5 className="text-sm text-slate-300 mb-2">
                            {item.first_air_date
                              ? new Date(item.first_air_date).getFullYear()
                              : 'Year not available'}
                          </h5>

                          {/* Overview */}
                          <p className="text-sm text-slate-400 flex-1">
                            {item.overview}
                          </p>

                          <button
                            onClick={() => onOpenModal(item)}
                            className='bg-indigo-500 px-4 py-2 rounded text-white hover:bg-indigo-600 mt-4 w-full'
                          >
                            Add to List
                          </button>
                        </div>
                      );
                    } else if (selectedCategory === 'videoGames') {

                      return (
                        <div key={item.id} className='bg-indigo-900/75 sm:p-6 rounded shadow flex flex-col'>

                          {/* Video Game Image */}
                          {item.background_image && (
                            <img 
                              src={`${item.background_image}`}
                              alt={`${item.name} cover`}
                              className="sm:w-48 md:w-64 lg:w-full h-48 sm:h-64 md:h-72 lg:h-80 object-contain mb-4 rounded"
                              />
                          )}

                          {/* Name */}
                          <h4 className="text-xl font-semibold text-slate-100">
                            {item.name}
                          </h4>

                          {/* Release Date */}
                          <h5 className="text-sm text-slate-300 mb-2">
                            {item.released
                              ? new Date(item.released).getFullYear()
                              : 'Year not available'}
                          </h5>
                          
                          {/* Platforms */}
                          {item.platforms && item.platforms.length > 0 && (
                            <p className='text-slate-300'>
                              {item.platforms.join(', ')}
                            </p>
                          )}
                        </div>
                      );
                    }
                
                    return null;
                  })}
                </div>
              )}
              {/* Pagination */}
              <div className='flex justify-center items-center mt-4'>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 text-white'}`}
                >
                  Previous
                </button>
                <span className='text-white mx-6'>{`Page ${currentPage} of ${totalPages}`}</span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 text-white'}`}
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