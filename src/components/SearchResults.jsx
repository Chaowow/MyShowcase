import React from 'react';

function SearchResults({ searchResults, onAddMovie }) {
  return (
    <div>
        {searchResults ? (
            <>
                <h3 className='text-2xl text-white mb-4'>Search Results:</h3>
                {searchResults.length === 0 ? (
                    <p className='text-slate-300'>No results found.</p>
                ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                        {searchResults.map((movie) => (
                            <div 
                                key={movie.id} 
                                className='bg-indigo-900/75 p-4 rounded shadow
                                flex flex-col'
                            >
                                {movie.poster_path && (
                                    <div className='flex justify-center items-center mb-4'>
                                        <img
                                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                            alt={movie.title}
                                            className="w-32 sm:w-40 md:w-64 h-auto 
                                            object-contain mb-2 rounded"
                                        />
                                 </div>
                                )}
                                <div className='flex-1'>
                                    <h4 className="text-xl font-semibold text-slate-100">{movie.title}</h4>
                                    <h5 className="text-sm text-slate-300 mb-2">
                                        {movie.release_date
                                            ? new Date(movie.release_date).getFullYear()
                                            : 'Year not available'}
                                    </h5>
                                    <p className="text-sm text-slate-400">{movie.overview}</p>
                                </div>

                                <div className='mt-4'>
                                    <button
                                        onClick={() => onAddMovie(movie)}
                                        className='bg-indigo-500 px-4 py-2 rounded text-white
                                        hover:bg-indigo-600 w-full'
                                    >
                                        Add to List
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        ) : null}
    </div>
  );
}

export default SearchResults;