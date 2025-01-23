import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Form from '../components/Form';
import SearchResults from '../components/SearchResults';
import useDebounce from '../hooks/useDebounce';
import Modal from '../components/Modal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function Create() {
    const [open, setOpen] = useState(false); // Controls whether the create list form is opem
    const [searchQuery, setSearchQuery] = useState(''); // Holds the current search query input
    const [searchResult, setSearchResults] = useState(null); // Stores the search results from API calls 
    const [userList, setUserList] = useState([]); // Stores the user's created lists
    const [isModalOpen, setIsModalOpen] = useState(false); // Controls the modal visibility
    const [selectedItem, setSelectedItem] = useState(null); // Holds the item selected from search results
    const [isEditing, setIsEditing] = useState(false); // Tracks whether a list title/description is being edited
    const [tempTitle, setTempTitle] = useState(''); // Temporary state for editing list titles
    const [tempDescription, setTempDescription] = useState(''); //  Temporary state for editing list descriptions
    const [collapsedLists, setCollapsedLists] = useState(() => {
        // Tracks whether lists are collapsed or expanded
        const initialState = {};
        userList.forEach((_, index) => {
            initialState[index] = false;
        });

        return initialState;
    });
    const [isSmallScreen, setIsSmallScereen] = useState(window.innerWidth <= 640); // Tracks if the screen size is small
    const [currentPage, setCurrentPage] = useState(1); //Tracks the current search result page
    const [totalPages, setTotalPages] = useState(1); // Tracks the total pages available for the current search
    const [isButtonVisible, setIsButtonVisible] = useState(false); // Controls visibility of the scroll-to-top button
    const [selectedCategory, setSelectedCategory] = useState('movies'); // Tracks the currently selected search category 

    // Update screen size on resize 
    useEffect(() => {
        const handleResize = () => setIsSmallScereen(window.innerWidth <= 640);
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Show/hide scroll-to-top button based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 200) {
                setIsButtonVisible(true);
            } else { 
                setIsButtonVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll); 

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    
    const debouncedSearchQuery = useDebounce(searchQuery, 1000);

    // Fetch search results based on category and query
    const fetchResults = useCallback(
        async (query, paginationKey = 1) => {
            const categoryConfig = {
                movies: {
                    url: 'http://localhost:5000/api/tmdb',
                    params: { query, page: paginationKey, type: 'movie' },
                    processResponse: (data) => ({
                        results: data.results,
                        totalPages: data.total_pages
                    })
                },
                tvShows: {
                    url: 'http://localhost:5000/api/tmdb',
                    params: { query, page: paginationKey, type: 'tv' },
                    processResponse: (data) => ({
                        results: data.results,
                        totalPages: data.total_pages
                    })
                },
                books: {
                    url: 'http://localhost:5000/api/books',
                    params: { query, startIndex: (paginationKey - 1) * 20, maxResults: 20 },
                    processResponse: (data) => {
                        const totalItems = data.totalItems || 0;
                        return {
                            results: data.items || [],
                            totalPages: Math.ceil(totalItems / 20)
                        };
                    }
                },
                videoGames: {
                    url: 'http://localhost:5000/api/rawg',
                    params: { query, page: paginationKey, page_size: 20 },
                    processResponse: (data) => ({
                        results: data.results,
                        totalPages: Math.ceil(data.count / 20)
                    })
                }
            };

            const config = categoryConfig[selectedCategory];
            if (!config) return;

            try {
                const response = await axios.get(config.url, { params: config.params });
                const { results = [], totalPages = 0 } = config.processResponse(response.data);

                setSearchResults(results);
                setTotalPages(totalPages);
            } catch (error) {
                console.error('Error fetching results', error.message);
                setSearchResults([]); 
                setTotalPages(0); 
            }
        },
    
        [selectedCategory]
    );
    
    // Fetch results when the debounced search query changes
    useEffect(() => {
        if (debouncedSearchQuery) {
            fetchResults(debouncedSearchQuery);
        } else {
            setSearchResults(null);
        }
    }, [debouncedSearchQuery, fetchResults]);

    // Fetch results when the current page changes
    useEffect(() => {
        if (searchQuery) {
            fetchResults(searchQuery, currentPage);
        }
    }, [searchQuery, currentPage, fetchResults]);

    const maxChar = 52;

    const openForm = () => setOpen(!open);

    const categories = [
        { id: 'movies', label: 'Movies'},
        { id: 'tvShows', label: 'Tv Shows'},
        { id: 'books', label: 'Books'},
        { id: 'videoGames', label: 'Video Games'}
    ];

    const saveList = (list) => {
        setUserList([...userList, { ...list, items: [] }]);
    };

    // Add an item (movie, Tv show, books, or video gamne) to a user-created list
    const addItemToList = (listTitle, item) => {
        const isBook = !!item.volumeInfo;
        const isVideoGame = !!item.background_image;

        const itemToAdd = {
            title: item.title || item.name || item.volumeInfo?.title || 'Unknown Title',
            release_date: item.release_date
                ? new Date(item.release_date).getFullYear()
                : item.first_air_date
                ? new Date(item.first_air_date).getFullYear()
                : item.volumeInfo?.publishedDate
                ? new Date(item.volumeInfo.publishedDate).getFullYear()
                : item.released
                ? new Date(item.released).getFullYear()
                : 'No year available',
            description: isBook
                ? item.volumeInfo?.authors?.join(', ') || 'Author not available'
                : isVideoGame
                ? Array.isArray(item.platforms)
                    ? item.platforms.join(', ')
                    : 'Platforms not available'
                : item.overview || 'No description available.',
            poster_path: item.poster_path
                ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                : item.volumeInfo?.imageLinks?.thumbnail 
                || item.background_image
                || 'https://via.placeholder.com/300x450?text=No+Image',
        };
    
        setUserList((prevLists) =>
            prevLists.map((list) =>
                list.title === listTitle
                    ? { ...list, items: [...list.items, itemToAdd] }
                    : list
            )
        );
    };

    const openModal = (movie) => {
        setSelectedItem(movie);
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    }

    // Get styling for medals in the list, may change to better styling/animation
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

    // Updates the order of items in a list after a drag-and-drop action
    const handleDragEnd = (result, listIndex) => {
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        setUserList((prevLists) => 
            prevLists.map((list, i) => {
                if (i !== listIndex) return list;

                const updatedItems = Array.from(list.items);
                const [movedItem] = updatedItems.splice(sourceIndex, 1);
                updatedItems.splice(destinationIndex, 0, movedItem);

                return { ...list, items: updatedItems};
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
                                    <Droppable droppableId={`list-${index}`} type='ITEMS' direction={isSmallScreen ? 'vertical' : 'horizontal'} >
                                        {(provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className='mt-6 grid grid-cols-1 sm:grid-cols-2 
                                                md:grid-cols-3 lg:grid-cols-5 gap-6'
                                            >
                                                {list.items.map((item, itemIndex) => {
                                                    const { background, border, text } = getMedalStyle(itemIndex);

                                                    return (
                                                        <Draggable draggableId={`item-${itemIndex}`} index={itemIndex} key={itemIndex}>
                                        
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
                                                                        if (window.confirm(`Are you sure you want to delete the movie: ${item.title}?`)) {
                                                                            setUserList((prevLists) => prevLists.map((list, i) => 
                                                                                i === index ? { ...list, items: list.items.filter((_, j) => j !== itemIndex), } 
                                                                                : list
                                                                                )
                                                                            );
                                                                        }
                                                                    }}
                                                                    className='absolute py-2 top-2 right-2 sm:w-4 sm:h-4 md:w-5 md:h-5 flex items-center justify-center 
                                                                    bg-indigo-100 rounded-full hover:bg-indigo-300/50 shadow transition duration-200 ease-in-out'
                                                                    aria-label={`Delete ${item.title}`}
                                                                >
                                                                    &times;    
                                                                </button>

                                                            
                                                                <h5 className={`absolute top-2 left-2 w-6 h-6 flex items-center justify-center ${background}
                                                                text-xs rounded-full font-bold shadow`}>
                                                                    {text}
                                                                </h5>
                                                                
                                                                <h5 className='mt-4 text-base font-bold text-gray-800 text-center'>
                                                                    {item.title}
                                                                </h5>

                                                                <p className='text-xs text-gray-600 mb-3'>
                                                                    {item.release_date}
                                                                </p>

                                                                <img src={item.poster_path} alt={item.title} 
                                                                className='w-28 sm:w-36 md:w-48 h-auto 
                                                                object-contain mb-3 rounded'/>

                                                                <p className='text-xs text-gray-600 text-center'>
                                                                    {item.description}
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

        {/* Search Input Tabs */}
        <div className='flex space-x-4 mb-4'>
            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded
                        ${selectedCategory === category.id
                            ? 'bg-indigo-500 text-white'
                            : 'bg-indigo-200 text-indigo-600 border border-indigo-500'
                    }`}
                >
                    {category.label}
                </button>
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
        
        <SearchResults 
            searchResults={searchResult} 
            onOpenModal={openModal} 
            currentPage={currentPage} 
            totalPages={totalPages} 
            setCurrentPage={setCurrentPage}
            selectedCategory={selectedCategory}
        />
        
        {isButtonVisible && (
            <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                className='fixed bottom-4 right-4 bg-indigo-500 text-white px-4 py-2 rounded shadow-md'
            >
                Scroll-to-Top
            </button>
        )}

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
                                addItemToList(list.title, selectedItem);
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