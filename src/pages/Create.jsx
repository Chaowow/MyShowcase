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
    const [userList, setUserList] = useState([]);

    const openForm = () => setOpen(!open);
    const saveList = (list) => {
        setUserList([...userList, list]);
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
                </div>
            ))}
        </div>
    </div>
  );
}

export default Create;