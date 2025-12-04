import React, { useState } from 'react';
import * as Sentry from '@sentry/react';
import toast from 'react-hot-toast';

function Contact() {
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({ email: '', description: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'description') setDescription(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required.'
    if (!description.trim()) newErrors.description = `You can't just give us your email without saying anything silly.`;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch('https://formspree.io/f/mvgrgoeq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          message: description
        })
      });


      if (res.ok) {
        setSubmitted(true);
        toast.success(`Message sent successfully! We'll get back to you as soon as possible.`);
        setEmail('');
        setDescription('');
        setErrors({});

        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      } else {
        throw new Error('Message failed to send');
      }
    } catch (err) {
      toast.error('Something went wrong. Try again later.');
      setErrors({ description: 'Something went wrong. Try again later.' });
      Sentry.captureException(err);
    }
  };

  return (
    <div className='bg-indigo-950 min-h-screen p-6 text-white'>
      <h1 className='text-3xl font-bold text-center mb-6'>
        Get in Touch with Us!
      </h1>

      <hr className='border-t border-indigo-500 my-6 w-3/4 mx-auto' />


      <p className='text-lg text-center max-w-3xl mx-auto mb-4'>
        Have a question, found a bug, or just want to say hi?
        We’d love to hear from you! Drop us a message and we'll get back to you as soon as possible.
      </p>
      <p className='text-lg text-center max-w-3xl mx-auto mb-10'>
        Whether you're reporting an issue, suggesting a feature, or sharing your favorite MyTopShowcase moment,
        your feedback helps us improve and grow!
      </p>

      <hr className='border-t border-indigo-500 my-6 w-3/4 mx-auto' />

      <form
        onSubmit={handleSubmit}
        className='p-6 max-w-lg mx-auto border border-indigo-300 rounded-lg shadow-lg bg-indigo-900/40'
      >
        <label className='block mb-2 font-semibold text-slate-200'>Email</label>
        <input
          type='email'
          name='email'
          value={email}
          onChange={handleChange}
          placeholder='Please enter email'
          className='border p-2 mb-4 w-full text-black bg-slate-200 focus:ring-2 focus:ring-indigo-300'

        />
        {errors.email && <p className='text-red-400 text-sm mb-3'>{errors.email}</p>}

        <label className='block mb-2 font-semibold text-slate-200'>Description</label>
        <textarea
          name='description'
          value={description}
          onChange={handleChange}
          placeholder='Please enter your feedback'
          className='border p-2 mb-4 w-full text-black bg-slate-200 focus:ring-2 focus:ring-indigo-300'
          rows='4'

        ></textarea>
        {errors.description && <p className='text-red-400 text-sm mb-3'>{errors.description}</p>}

        <button
          type='submit'
          className='bg-indigo-500 text-white px-6 py-2 rounded-md shadow-md
        hover:bg-indigo-600 hover:shadow-lg transition duration-200 ease-in-out'
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Contact;