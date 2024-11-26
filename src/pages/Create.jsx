import { useState, useEffect } from 'react';
import axios from 'axios';
import Form from '../components/Form';
import SearchResults from '../components/SearchResults';
import useDebounce from '../hooks/useDebounce';
import Modal from '../components/Modal';

function Create() {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResults] = useState(null);
    const [userList, setUserList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);

    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    useEffect(() => {
        if (debouncedSearchQuery) {
            fetchMovies(debouncedSearchQuery);
        } else {
            setSearchResults(null);
        }
    }, [debouncedSearchQuery]);

    const openForm = () => setOpen(!open);

    const saveList = (list) => {
        setUserList([...userList, { ...list, movies: [] }]);
    };

    const addMovieToList = (listTitle, movie) => {
        const movieToAdd = {
            title: movie.title || 'Unknown Title',
            release_date: movie.release_date
                ? new Date(movie.release_date).getFullYear()
                : 'Year not available',
            overview: movie.overview || 'No description available.',
            poster_path: movie.poster_path
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                : 'https://via.placeholder.com/300x450?text=No+Image',
        };
    
        setUserList((prevLists) =>
            prevLists.map((list) =>
                list.title === listTitle
                    ? { ...list, movies: [...list.movies, movieToAdd] }
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

    const openModal = (movie) => {
        setSelectedMovie(movie);
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMovie(null);
    }

  return (
    <div className='bg-indigo-950 p-6 min-h-screen overflow-x-hidden'>
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

                <div key={index} className='bg-indigo-900 p-6 mb-6 rounded-lg shadow-lg'>

                    <div className='flex justify-between items-center mb-2'>
                        <h4 className='text-2xl sm:text-3xl font-bold text-slate-100 
                        break-words whitespace-normal'>
                            {list.title}
                        </h4>
                        <button onClick={() => { if (window.confirm(`Are you sure you want to delete the list: ${list.title}?`)) {
                            setUserList((prevLists) => prevLists.filter((_, i) => i !== index));
                            }
                        }}
                        className='bg-red-500 text-white px-2 py-1.5 rounded hover:bg-red-700'
                        >
                            Delete
                        </button>
                    </div>

                    <p className='text-md font-semibold text-slate-300 mb-2 break-words
                    whitespace-normal'>
                        {list.description}
                    </p>

                    <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 
                    md:grid-cols-3 gap-6'>

                        {list.movies.map((movie, movieIndex) => (

                            <div 
                            key={movieIndex} 
                            className='bg-indigo-200 p-4 rounded-lg shadow-md flex flex-col items-center
                            hover:shadow-lg hover:scale-105 transition-transform duration-200'
                            > 

                                <h5 className='text-lg font-bold text-gray-800 mb-2'>
                                    {movie.title}
                                </h5>

                                <p className='text-sm text-gray-600 mb-4'>
                                    {movie.release_date}
                                </p>

                                <img src={movie.poster_path} alt={movie.title} 
                                className='w-32 sm:w-40 md:w-64 h-auto 
                                object-contain mb-4 rounded'/>

                                <p className='text-sm text-gray-600 '>
                                    {movie.overview}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
         {/* Search Input */}
         <input 
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search for something...'
            className='p-2 border rounded w-full mb-4'
        />

        {/*  Search Results */}
        <SearchResults searchResults={searchResult} onOpenModal={openModal} />
        
        <Modal isOpen={isModalOpen} onClose={closeModal}>
            <h3 className='text-xl font-semibold mb-4'>Select a List</h3>
            <ul>
                {userList.map((list, index) => (
                    <li key={index} className='border-b py-2 flex justify-between items-center'>

                        <h4 className='flex-1 font-bold text-xs sm:text-sm lg:text-base overflow-hidden text-ellipsis 
                        whitespace-nowrap max-w-[80%]'>
                            {list.title}
                        </h4>

                        <button 
                            onClick={() => {
                                addMovieToList(list.title, selectedMovie);
                                closeModal();
                            }}
                            className='bg-indigo-500 text-white px-3 py-1 rounded
                            hover:bg-indigo-600'
                        >
                            Add
                        </button>
                    </li>
                ))}
            </ul>
        </Modal>

        
    </div>
  );
}

export default Create;