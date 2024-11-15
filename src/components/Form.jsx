import { useState } from "react";

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


export default Form;