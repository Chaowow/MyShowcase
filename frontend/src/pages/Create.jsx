import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Form from '../components/Form';
import SearchResults from '../components/SearchResults';
import useDebounce from '../hooks/useDebounce';
import Modal from '../components/Modal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ConfirmationModal from '../components/ConfirmationModal';
import placeholder from '../assets/placeholder.jpg'
import { useAuth0 } from '@auth0/auth0-react';

function Create() {
    const { user, isAuthenticated } = useAuth0();
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
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(() => () => { });
    const [modalMessage, setModalMessage] = useState('');
    const [isLoadingState, setIsLoadingState] = useState(false);
    const [cachedResults, setCachedResults] = useState({});

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
            const cacheKey = `${selectedCategory}-${query}-${paginationKey}`

            if (cachedResults[cacheKey]) {
                setSearchResults(cachedResults[cacheKey].results);
                setTotalPages(cachedResults[cacheKey].totalPages);
                return;
            }
            
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
                    params: { query, page: paginationKey },
                    processResponse: (data) => ({
                        results: data.results,
                        totalPages: data.totalPages
                    })
                },
                videoGames: {
                    url: 'http://localhost:5000/api/rawg',
                    params: { query, page: paginationKey},
                    processResponse: (data) => {
                        return {
                            results: data.results,
                            totalPages: data.total_pages
                        };
                    }
                }
            };
            

            const config = categoryConfig[selectedCategory];
            if (!config) return;

            setIsLoadingState(true);

            try {
                const response = await axios.get(config.url, { params: config.params });
                
                const { results = [], totalPages = 0 } = config.processResponse(response.data);

                setSearchResults(results);
                setTotalPages(totalPages);

                setCachedResults((prevCache) => ({
                    ...prevCache,
                    [cacheKey]: { results, totalPages }
                }));
            } catch (error) {
                console.error('Error fetching results', error.message);
                setSearchResults([]);
                setTotalPages(0);
            } finally {
                setIsLoadingState(false);
            }
        },

        [selectedCategory, cachedResults]
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

    useEffect(() => {
        const fetchUserLists = async () => {
            if (isAuthenticated && user) {
                try {
                    const res = await fetch(`http://localhost:5000/lists/${user.sub}`);
                    const data = await res.json();
                    setUserList(data);
                } catch (err) {
                    console.error('Error fetching user lists:', err);
                }
            } else {
                const guestLists = localStorage.getItem('guestLists');
                if (guestLists) {
                    setUserList(JSON.parse(guestLists));
                }
            }
        };

        fetchUserLists();
    }, [isAuthenticated, user]);

    const maxChar = 52;

    const openForm = () => setOpen(!open);

    const categories = [
        { id: 'movies', label: 'Movies' },
        { id: 'tvShows', label: 'Tv Shows' },
        { id: 'books', label: 'Books' },
        { id: 'videoGames', label: 'Video Games' }
    ];

    const saveList = async (list) => {
        const newList = {
            id: Date.now(),
            title: list.title,
            items: list.item || [],
            description: list.description || '',
            auth0_id: user?.sub || null
        };


        if (isAuthenticated && user) {
            try {
                const response = await fetch('http://localhost:5000/lists', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newList)
                });

                if (response.ok) {
                    const savedList = await response.json();
                    setUserList([...userList, savedList]);
                } else {
                    console.error('Failed to save list');
                }
            } catch (err) {
                console.error('Error saving list:', err);
            }
        } else {
            const updatedLists = [...userList, newList];
            setUserList(updatedLists);
            localStorage.setItem('guestLists', JSON.stringify(updatedLists));
        }
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
                    : null,
            image: item.poster_path
                ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                : item.volumeInfo?.imageLinks?.thumbnail
                || item.background_image
                || placeholder,
        };

        setUserList((prevLists) => {
            const updatedLists = prevLists.map((list) => {
                if (list.title === listTitle && list.items.length <= 5) {
                    const updatedList = { ...list, items: [...list.items, itemToAdd] };

                    if (isAuthenticated && user) {
                        updateListOnServer(updatedList);
                    }
                    return updatedList;
                }
                return list;
            });

            if (!isAuthenticated || !user) {
                localStorage.setItem('guestLists', JSON.stringify(updatedLists));
            }

            return updatedLists;
        });
    };

    const updateListOnServer = async (list) => {
        try {
            const response = await fetch(`http://localhost:5000/lists/${list.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: list.title,
                    description: list.description || '',
                    items: list.items
                })
            });

            if (!response.ok) {
                console.error('Failed to update list');
            }
        } catch (err) {
            console.error('Error updating list:', err)
        }
    };

    const openModal = (movie) => {
        setSelectedItem(movie);
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    }

    // Get styling for medals in the list
    const getMedalStyle = (movieIndex) => {
        if (movieIndex === 0) {
            return {
                background: 'bg-gradient-to-br from-yellow-200 to-yellow-400 shadow-lg animate-pulse',
                border: 'border-yellow-300 border-4 shadow-yellow-400 ring-2 ring-yellow-500',
                text: '1st'
            };
        }
        if (movieIndex === 1) {
            return {
                background: 'bg-gradient-to-br from-gray-200 to-gray-400 shadow-md',
                border: 'border-gray-400 border-4 shadow-gray-400',
                text: '2nd'
            };
        }
        if (movieIndex === 2) {
            return {
                background: 'bg-gradient-to-br from-yellow-600 to-yellow-800 shadow-md',
                border: 'border-yellow-700 border-4 shadow-yellow-900',
                text: '3rd'
            };
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

                const updatedList = { ...list, items: updatedItems };
                updateListOnServer(updatedList);

                return updatedList;
            })
        );
    };

    return (
        <div className='bg-indigo-950 p-6 min-h-screen overflow-x-hidden'>
            <button className='bg-indigo-500 text-white mb-4 px-4 py-2
            rounded' onClick={openForm}>
                CREATE NEW LIST
            </button>

            <Form open={open} onSave={saveList} />

            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onClose={() => setConfirmationModalOpen(false)}
                onConfirm={modalAction}
                message={modalMessage}
            />

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
                                                const updatedLists = userList.map((item, i) =>
                                                    i === index
                                                        ? { ...item, title: tempTitle, description: tempDescription }
                                                        : item
                                                );

                                                setUserList(updatedLists);
                                                updateListOnServer(updatedLists[index]);
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
                                                        setModalMessage(`Are you sure you want to delete the list: ${list.title}?`);
                                                        setModalAction(() => async () => {
                                                            try {
                                                                const res = await fetch(`http://localhost:5000/lists/${list.id}`, {
                                                                    method: 'DELETE'
                                                                });

                                                                if (res.ok) {
                                                                    setUserList((prevLists) => prevLists.filter((_, i) => i !== index));
                                                                } else {
                                                                    console.error('Failed to delete list');
                                                                }
                                                            } catch (err) {
                                                                console.error('Error deleting list:', err);
                                                            }
                                                        });

                                                        setConfirmationModalOpen(true);
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

                                {/* User list */}
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
                                                                ${border}`}
                                                                >
                                                                    <button
                                                                        onClick={() => {
                                                                            setModalMessage(`Are you sure you want to delete the item: ${item.title}?`);
                                                                            setModalAction(() => () =>
                                                                                setUserList((prevLists) =>
                                                                                    prevLists.map((list, i) => {
                                                                                        if (i === index) {
                                                                                            const updatedList = {
                                                                                                ...list,
                                                                                                items: list.items.filter((_, j) => j != itemIndex)
                                                                                            };
                                                                                            updateListOnServer(updatedList);
                                                                                            return updatedList;
                                                                                        }
                                                                                        return list;
                                                                                    })
                                                                                )
                                                                            );

                                                                            setConfirmationModalOpen(true);
                                                                        }}
                                                                        className='absolute py-2 top-2 right-2 sm:w-4 sm:h-4 md:w-5 md:h-5 flex items-center justify-center 
                                                                      bg-indigo-100 rounded-full hover:bg-indigo-300/50 shadow transition duration-200 ease-in-out'
                                                                        aria-label={`Delete ${item.title}`}
                                                                    >
                                                                        &times;
                                                                    </button>


                                                                    <h5 className={`absolute top-2 left-2 w-7 h-7 flex items-center justify-center ${background}
                                                                    text-xs rounded-full font-bold`}>
                                                                        {text}
                                                                    </h5>

                                                                    <h5 className='mt-4 text-base font-bold text-gray-800 text-center'>
                                                                        {item.title}
                                                                    </h5>

                                                                    <p className='text-xs text-gray-600 mb-3'>
                                                                        {item.release_date}
                                                                    </p>

                                                                    <img
                                                                        src={item.image || placeholder}
                                                                        alt={item.title}
                                                                        className='w-36 sm:w-48 md:w-64 lg:w-72 h-48 sm:h-64 md:h-80 
                                                                        lg:h-96 object-contain mb-3 rounded'
                                                                    />
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
                                                {provided.placeholder && (
                                                    <div style={{ pointerEvents: 'none' }}>{provided.placeholder}</div>
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
            <div className='flex overflow-x-auto sm:justify-center gap-2 sm:gap-4 mb-4 px-2'>
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => {
                            setSelectedCategory(category.id)
                            setCurrentPage(1);
                        }}
                        className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded whitespace-nowrap
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
                isLoadingState={isLoadingState}
            />

            {isButtonVisible && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className='fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-indigo-500
                  text-white px-4 py-2 rounded shadow-md'
                >
                    Scroll-to-Top
                </button>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <h3 className='text-xl font-semibold mb-4'>Select a List</h3>
                <ul>
                    {userList.map((list, index) => (
                        <li
                            key={index}
                            className={`border-b py-2 flex justify-between items-center transition
                            ${list.items.length >= 5 ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >

                            <h4 className='flex-1 font-bold text-xs sm:text-sm lg:text-base overflow-hidden text-ellipsis 
                            whitespace-nowrap max-w-[80%]'>
                                {list.title}
                            </h4>

                            <button
                                onClick={() => {
                                    if (list.items.length < 5) {
                                        addItemToList(list.title, selectedItem);
                                        closeModal();
                                    }
                                }}
                                disabled={list.items.length >= 5}
                                className={`bg-indigo-500 text-white px-3 py-1 rounded
                              hover:bg-indigo-600 ${list.items.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {list.items.length >= 5 ? 'Full' : 'Add'}
                            </button>
                        </li>
                    ))}
                </ul>
            </Modal>
        </div>
    );
}

export default Create;