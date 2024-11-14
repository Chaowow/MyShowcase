import { useState } from 'react';
import axios from 'axios';

function Form ({ open, onSave }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ title, description });

        setTitle('');
        setDescription('');
    };

    return (
            open ? (
            <form onSubmit={handleSubmit} className='p-4 border rounded shadow-lg'>
                <label className='block mb-2 text-white'>List Title</label>
                <input 
                    type='text'
                    value={title}
                    onChange={(e) =>setTitle(e.target.value)}
                    className='border p-2 mb-4 w-full bg-slate-200'
                    placeholder='Enter List Title'
                    required
                />

                <label className='block mb-2 text-white'>Description</label>
                <textarea 
                    type='text'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className='border p-2 mb-4 w-full bg-slate-200'
                    placeholder='Enter Description'
                    rows='4'
                ></textarea>

                <button type='submit' className='bg-indigo-500 text-white
                px-4 py-2 rounded'>
                    Save List
                </button>
            </form>
        ) : null
    );
}


function Create() {
    const [open, setOpen] = useState(false);
    const [userList, setUserList] = useState([
        {
          title: "Favorite Horror Movies",
          description: "My top horror movies that are truly scary.",
          movies: [
            {
              title: "The Shining",
              year: 1980,
              description: "A family heads to an isolated hotel where an evil presence influences the father into violence.",
              image: "https://via.placeholder.com/100x150",
            },
            {
              title: "Get Out",
              year: 2017,
              description: "A young African-American man visits his white girlfriend's parents for the weekend and discovers disturbing secrets.",
              image: "https://via.placeholder.com/100x150",
            },
            {
              title: "Hereditary",
              year: 2018,
              description: "A grieving family is haunted by tragic and disturbing occurrences.",
              image: "https://via.placeholder.com/100x150",
            },
          ],
        },
        {
          title: "Top Sci-Fi Books",
          description: "Best sci-fi books with gripping plots and futuristic themes.",
          movies: [
            {
              title: "Dune",
              year: 1965,
              description: "A young nobleman and his family are caught in a feud over control of a desert planet with a valuable resource.",
              image: "https://via.placeholder.com/100x150",
            },
            {
              title: "Foundation",
              year: 1951,
              description: "A mathematician develops a way to save civilization, foreseeing the fall of a galactic empire.",
              image: "https://via.placeholder.com/100x150",
            },
          ],
        },
      ]);

    const openForm = () => setOpen(!open);
    const saveList = (list) => {
        setUserList([...userList, { ...list, movies: [] }]);
    };

  return (
    <div className='bg-indigo-950 p-6 min-h-screen'>
        <button className='bg-indigo-500 text-white mb-4 px-4 py-2
        rounded' onClick={openForm}>
            CREATE NEW LIST
        </button>

        <Form open={open} onSave={saveList}/>

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