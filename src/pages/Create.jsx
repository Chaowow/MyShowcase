import { useState, useEffect } from 'react';
import axios from 'axios';
import Form from '../components/Form';
import SearchResults from '../components/SearchResults';
import useDebounce from '../hooks/useDebounce';

function Create() {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResults] = useState(null);
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const [userList, setUserList] = useState([]);

    const openForm = () => setOpen(!open);
    const saveList = (list) => {
        setUserList([...userList, { ...list, movies: [] }]);
    };

    const addMovieToList = (movie) => {
        const selectedListTitle = prompt(
            'Enter the title of the list to which you want to add this movie:'
        );

        if (!selectedListTitle) return;

        setUserList((prevLists) => 
            prevLists.map((list) => 
                list.title === selectedListTitle
                ? { ...list, movies: [...list.movies, movie] }
                : list
            )
        );
    };

    const fetchMovies = async (query) => {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        try {
            const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
                params: {
                    api_key: apiKey,
                    query: query
                },
            });
            setSearchResults(response.data.results);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    useEffect(() => {
        if (debouncedSearchQuery) {
            fetchMovies(debouncedSearchQuery);
        } else {
            setSearchResults(null);
        }
    }, [debouncedSearchQuery]);

  return (
    <div className='bg-indigo-950 p-6 min-h-screen'>

         {/* Search Input */}
         <input 
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search for something...'
            className='p-2 border rounded w-full mb-4'
        />

        {/*  Search Results */}
        <SearchResults searchResults={searchResult} onAddMovie={addMovieToList} />

        <button className='bg-indigo-500 text-white mb-4 px-4 py-2
        rounded' onClick={openForm}>
            CREATE NEW LIST
        </button>

        <Form open={open} onSave={saveList}/>

        {/* User List */}
        <div className='mt-8'>
            {userList.length > 0 && 
            <h3 className='text-2xl text-white mb-4'>Your Lists:</h3>}
            {userList.map((list, index) => (
                <div key={index} className='bg-slate-200 p-4 mb-4 rounded shadow'>
                    <h4 className='text-xl font-semibold'>{list.title}</h4>
                    <p>{list.description}</p>
                    <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 
                    md:grid-cols-3 gap-4'>
                        {list.movies.map((movie, movieIndex) => (
                            <div 
                            key={movieIndex} 
                            className='bg-white p-4 rounded shadow'
                            > 
                                <h5 className='text-lg font-semibold'>
                                    {movie.title} ({movie.year})
                                </h5>
                                <img src={movie.image} alt={movie.title} 
                                className='w-full h-48 object-cover mb-2 rounded'/>
                                <p className='text-sm text-gray-600'>
                                    {movie.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}

export default Create;