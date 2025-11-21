import * as Sentry from '@sentry/react';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Form from '../components/Form';
import SearchResults from '../components/SearchResults';
import useDebounce from '../hooks/useDebounce';
import Modal from '../components/Modal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ConfirmationModal from '../components/ConfirmationModal';
import placeholder from '../assets/placeholder.jpg';
import { useAuth0 } from '@auth0/auth0-react';
import toast from 'react-hot-toast';
import { proxied } from '../utils/img';

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

    const debouncedSearchQuery = useDebounce(searchQuery, 2000);

    // Fetch search results based on category and query
    const fetchResults = useCallback(
        async (query, paginationKey = 1) => {
            const cacheKey = `${selectedCategory}-${query}-${paginationKey}`

            if (cachedResults[cacheKey]) {
                setSearchResults(cachedResults[cacheKey].results);
                setTotalPages(cachedResults[cacheKey].totalPages);
                setIsLoadingState(false);
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
                    params: { query, page: paginationKey },
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
            } catch (err) {
                toast.error('Error fetching results');
                Sentry.captureException(err);
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
                    toast.error('Error fetching lists');
                    Sentry.captureException(err);
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

    useEffect(() => {
        const migrateGuestLists = async () => {
            if (isAuthenticated && user) {
                const guestData = localStorage.getItem('guestLists');
                if (!guestData) return;

                const guestLists = JSON.parse(guestData);

                try {
                    for (const list of guestLists) {
                        const response = await fetch('http://localhost:5000/lists', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                auth0_id: user.sub,
                                title: list.title,
                                items: list.items,
                                description: list.description || ''
                            })
                        });

                        if (!response.ok) {
                            toast.error(`Failed to migrate list`);
                            Sentry.captureException(`Failed to migrate list: ${list.title}`);
                        }
                    }

                    localStorage.removeItem('guestLists');

                    const res = await fetch(`http://localhost:5000/lists/${user.sub}`);
                    const userLists = await res.json();
                    setUserList(userLists);

                    toast.success('Your lists have been saved!');
                } catch (err) {
                    toast.error('Something went wrong saving your lists');
                    Sentry.captureException('Error migrating guest lists:', err);
                }
            }
        };

        migrateGuestLists();
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (!isAuthenticated) {
            const alreadyDismissed = localStorage.getItem('dismissedGuestBanner');
            if (!alreadyDismissed) {
                toast.custom((t) => (
                    <div
                        className={`bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3
                            rounded shadow-md flex items-start justify-between w-full max-w-xl mx-auto mt-4 transition-all
                            duration-300 ${t.visible ? 'opacity-100 trnaslate-y-0' : 'opacity-0 -translate-y-2'}`}
                    >
                        <div>
                            <strong className='font-bold'>Guest Mode:</strong>
                            <span className='block sm:inline ml-1'>
                                You're not signed in. Sign up or log in to save your lists permanently.
                            </span>
                        </div>

                        <button
                            onClick={() => {
                                localStorage.setItem('dismissedGuestBanner', 'true');
                                toast.dismiss(t.id);
                            }}
                            className='ml-4 text-yellow-700 hover:text-yellow-900 font-bold text-lg'
                            aria-label='Dismiss'
                        >
                            &times;
                        </button>
                    </div>
                ), { duration: Infinity });
            }
        }
    }, [isAuthenticated])

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
                    toast.error('Failed to save list');
                    Sentry.captureException('Failed to save list');
                }
            } catch (err) {
                toast.error('Error saving list');
                Sentry.captureException('Error saving list:', err);
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
                ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
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
                toast.error('Failed to update list');
                Sentry.captureException(
                    'Failed to update list due to unexpected server response.'
                );
            }
        } catch (err) {
            toast.error('Error updating list');
            Sentry.captureException(err);
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

        const updatedLists = userList.map((list, i) => {
            if (i !== listIndex) return list;

            const updatedItems = Array.from(list.items);
            const [movedItem] = updatedItems.splice(sourceIndex, 1);
            updatedItems.splice(destinationIndex, 0, movedItem);

            const updatedList = { ...list, items: updatedItems };

            if (isAuthenticated && user) {
                updateListOnServer(updatedList);
            }

            return updatedList
        });

        if (!isAuthenticated || !user) {
            localStorage.setItem('guestList', JSON.stringify(updatedLists));
        }

        setUserList(updatedLists);
    };

    return (
        <div className='bg-indigo-950 p-6 min-h-screen overflow-x-hidden'>
            <button className='bg-indigo-600 text-white mb-4 px-4 py-2
            rounded hover:bg-indigo-700' onClick={openForm}>
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

                        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2'>

                            {isEditing === index ? (
                                <div className='w-full'>
                                    <input
                                        id='edit-title-input'
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

                                                if (isAuthenticated && user) {
                                                    updateListOnServer(updatedLists[index]);
                                                } else {
                                                    localStorage.setItem('guestLists', JSON.stringify(updatedLists));
                                                }

                                                setIsEditing(null);
                                            }}
                                            className='bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700'
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(null)}
                                            className='bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700'
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h4 className='text-2xl sm:text-3xl font-bold text-slate-100 
                                    break-words whitespace-normal max-w-[90%] sm:max-w-[70%]'>
                                        {list.title}
                                    </h4>

                                    <div className='flex space-x-3'>
                                        <button
                                            onClick={() => setCollapsedLists((prev) => ({
                                                ...prev,
                                                [index]: !prev[index]
                                            }))}
                                            className='bg-blue-600 text-white px-2 py-1.5 rounded hover:bg-blue-700'>
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
                                                    className='bg-blue-600 text-white px-2 py-1 text-xs sm:text-sm rounded hover:bg-blue-700'
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setModalMessage(`Are you sure you want to delete the list: ${list.title}?`);
                                                        setModalAction(() => async () => {
                                                            try {
                                                                if (isAuthenticated && user) {
                                                                    const res = await fetch(`http://localhost:5000/lists/${list.id}`, {
                                                                        method: 'DELETE'
                                                                    });

                                                                    if (!res.ok) throw new Error('Failed to delete list from server');
                                                                }

                                                                const updatedLists = userList.filter((_, i) => i !== index);
                                                                setUserList(updatedLists);

                                                                if (!isAuthenticated || !user) {
                                                                    localStorage.setItem('guestLists', JSON.stringify(updatedLists));
                                                                }
                                                            } catch (err) {
                                                                toast.error('Failed to delete list. Please try again.');
                                                                Sentry.captureException(err);
                                                            }
                                                        });

                                                        setConfirmationModalOpen(true);
                                                    }}
                                                    className='bg-red-600 text-white px-2 py-1 text-xs sm:text-sm rounded hover:bg-red-700'
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
                                                                            setModalAction(() => () => {
                                                                                setUserList((prevLists) => {
                                                                                    const updatedLists = prevLists.map((list, i) => {
                                                                                        if (i === index) {
                                                                                            const updatedList = {
                                                                                                ...list,
                                                                                                items: list.items.filter((_, j) => j !== itemIndex),
                                                                                            };

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
                                                                            });

                                                                            setConfirmationModalOpen(true);
                                                                        }}
                                                                        className='absolute top-2 right-2 w-6 h-6 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center
                                                                        justify-center text-sm bg-indigo-100 rounded-full hover:bg-indigo-300/50 
                                                                        shadow transition duration-200 ease-in-out'
                                                                        aria-label={`Delete ${item.title}`}
                                                                    >
                                                                        &times;
                                                                        <span className='sr-only'>Delete item</span>
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
                                                                        loading='lazy'
                                                                        src={proxied(item?.image)}
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
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-indigo-100 text-indigo-700 border border-indigo-300 hover:bg-indigo-200'
                            }`}
                    >
                        {category.label}
                    </button>
                ))}
            </div>

            {/* Search Input */}
            <input
                id='search-input'
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
                isLoading={isLoadingState}
            />

            {isButtonVisible && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className='fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-indigo-600
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