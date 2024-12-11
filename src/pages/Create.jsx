import { useState, useEffect } from 'react';
import axios from 'axios';
import Form from '../components/Form';
import SearchResults from '../components/SearchResults';
import useDebounce from '../hooks/useDebounce';
import Modal from '../components/Modal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function Create() {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResults] = useState(null);
    const [userList, setUserList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [tempDescription, setTempDescription] = useState('');
    const [collapsedLists, setCollapsedLists] = useState(() => {
        const initialState = {};
        userList.forEach((_, index) => {
            initialState[index] = false;
        });

        return initialState;
    });
    const [isSmallScreen, setIsSmallScereen] = useState(window.innerWidth <= 640);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const handleResize = () => setIsSmallScereen(window.innerWidth <= 640);
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    
    useEffect(() => {
        if (debouncedSearchQuery) {
            fetchMovies(debouncedSearchQuery);
        } else {
            setSearchResults(null);
        }
    }, [debouncedSearchQuery]);

    useEffect(() => {
        if (searchQuery) {
            fetchMovies(searchQuery, currentPage);
        }
    }, [searchQuery, currentPage]);

    const maxChar = 52;

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
    
    const fetchMovies = async (query, page = 1) => {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        try {
            const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
                params: {
                    api_key: apiKey,
                    query: query,
                    page: page
                },
            });
            setSearchResults(response.data.results);
            setTotalPages(response.data.total_pages);
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

    const getMedalStyle = (movieIndex) => {
        if (movieIndex === 0) {
            return { background: 'bg-yellow-300', border: 'border-yellow-300 border-4', text: '1st'};
        }
        if (movieIndex === 1) {
            return { background: 'bg-gray-400', border: 'border-gray-400 border-4', text: '2nd'};
        }
        if (movieIndex === 2) {
            return { background: 'bg-yellow-700', border: 'border-yellow-700 border-4', text: '3rd'};
        }

        return { background: 'bg-indigo-200', border: 'border-indigo-200', text: movieIndex + 1 }
    }

    const handleDragEnd = (result, listIndex) => {
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        setUserList((prevLists) => 
            prevLists.map((list, i) => {
                if (i !== listIndex) return list;

                const updatedMovies = Array.from(list.movies);
                const [movedMovie] = updatedMovies.splice(sourceIndex, 1);
                updatedMovies.splice(destinationIndex, 0, movedMovie);

                return { ...list, movies: updatedMovies};
            })
        );
    };

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

                        {isEditing === index ? (
                            <div className='w-full'>
                                <input 
                                    type='text'
                                    value={tempTitle}
                                    onChange={(e) => {
                                        if (e.target.value.length <= maxChar) {
                                            setTempTitle(e.target.value);
                                        }
                                    }}
                                    className='border rounded p-2 w-full mb-2'
                                    placeholder='Edit Title'
                                />
                                <textarea
                                    value={tempDescription}
                                    onChange={(e) => setTempDescription(e.target.value)}
                                    className='border rounded p-2 w-full mb-2'
                                    rows='3'
                                    placeholder='Edit Description'
                                ></textarea>
                                
                                <div className='flex space-x-2'>
                                    <button
                                        onClick={() => {
                                            setUserList((prevLists) =>
                                                prevLists.map((item, i) => 
                                                    i === index 
                                                        ? { ...item, title: tempTitle, description: tempDescription }
                                                        : item
                                                )
                                            );
                                            setIsEditing(null);
                                        }}
                                        className='bg-green-500 text-white px-4 py-3 rounded hover:bg-green-600'
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(null)}
                                        className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h4 className='text-2xl sm:text-3xl font-bold text-slate-100 
                                break-words whitespace-normal'>
                                    {list.title}
                                </h4>

                                <div className='flex space-x-2'>
                                    <button 
                                        onClick={() => setCollapsedLists((prev) => ({
                                            ...prev,
                                            [index]: !prev[index]
                                        }))}
                                        className='bg-blue-500 text-white px-2 py-1.5 rounded hover:bg-blue-600'
                                    >
                                        {collapsedLists[index] ? '+' : '-'}
                                    </button>

                                    {!collapsedLists[index] && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setIsEditing(index);
                                                    setTempTitle(list.title);
                                                    setTempDescription(list.description);
                                                }}
                                                className='bg-blue-500 text-white px-2 py-1.5 rounded hover:bg-blue-600'
                                            >
                                                Edit
                                            </button>
                                    
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to delete the list: ${list.title}?`)) {
                                                        setUserList((prevLists) => prevLists.filter((_, i) => i !== index));
                                                    }
                                                }}
                                                className='bg-red-500 text-white px-2 py-1.5 rounded hover:bg-red-600'
                                            >    
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {isEditing !== index && !collapsedLists[index] && (
                        <>
                            <p className='text-md font-semibold text-slate-300 mb-2 break-words
                            whitespace-normal'>
                                {list.description}
                            </p>

                                {/* Movie list */}
                                <DragDropContext
                                    onDragEnd={(result) => handleDragEnd(result, index)}
                                >
                                    <Droppable droppableId={`list-${index}`} type='MOVIES' direction={isSmallScreen ? 'vertical' : 'horizontal'} >
                                        {(provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className='mt-6 grid grid-cols-1 sm:grid-cols-2 
                                                md:grid-cols-3 lg:grid-cols-5 gap-6'
                                            >
                                                {list.movies.map((movie, movieIndex) => {
                                                    const { background, border, text } = getMedalStyle(movieIndex);

                                                    return (
                                                        <Draggable draggableId={`movie-${movieIndex}`} index={movieIndex} key={movieIndex}>
                                        
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`bg-indigo-200 p-4 rounded-lg shadow-md flex flex-col items-center relative
                                                                hover:shadow-lg ${border}`}
                                                            >
                                                                <button 
                                                                    onClick={() => {
                                                                        if (window.confirm(`Are you sure you want to delete the movie: ${movie.title}?`)) {
                                                                            setUserList((prevLists) => prevLists.map((list, i) => 
                                                                                i === index ? { ...list, movies: list.movies.filter((_, j) => j !== movieIndex), } 
                                                                                : list
                                                                                )
                                                                            )
                                                                        }
                                                                    }}
                                                                    className='absolute py-2 top-2 right-2 sm:w-4 sm:h-4 md:w-5 md:h-5 flex items-center justify-center 
                                                                    bg-indigo-100 rounded-full hover:bg-indigo-300/50 shadow transition duration-200 ease-in-out'
                                                                    aria-label={`Delete ${movie.title}`}
                                                                >
                                                                    &times;    
                                                                </button>

                                                            
                                                                <h5 className={`absolute top-2 left-2 w-6 h-6 flex items-center justify-center ${background}
                                                                text-xs rounded-full font-bold shadow`}>
                                                                    {text}
                                                                </h5>
                                                                
                                                                <h5 className='mt-4 text-base font-bold text-gray-800 text-center'>
                                                                        {movie.title}
                                                                </h5>

                                                                <p className='text-xs text-gray-600 mb-3'>
                                                                    {movie.release_date}
                                                                </p>

                                                                <img src={movie.poster_path} alt={movie.title} 
                                                                className='w-28 sm:w-36 md:w-48 h-auto 
                                                                object-contain mb-3 rounded'/>

                                                                <p className='text-xs text-gray-600 text-center'>
                                                                    {movie.overview}
                                                                </p>
                                                            </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
                                                {provided.placeholder && (
                                                    <div style={{pointerEvents: 'none'}}>{provided.placeholder}</div>
                                                )}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                        </>
                    )}
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
        <SearchResults searchResults={searchResult} onOpenModal={openModal} currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage}/>
        
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