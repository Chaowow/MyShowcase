import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className='bg-indigo-800 min-h-screen flex flex-col 
    items-center justify-center text-center p-4'>
      <h1 className='text-4xl md:text-6xl font-bold text-indigo-950 mb-4'>
        Welcome to MyShowcase.
      </h1>
      <p className='text-lg md:text-2xl text-gray-900 max-w-xl mb-8'>
        Create and track lists of your favorite things, 
        from movies and TV shows to books and video games. Share with your friends.
      </p>

      <Link to='/discover'>
        <button className='bg-indigo-500 text-white px-6 py-3 
        rounded-lg text-lg md:text-xl hover:bg-indigo-600'>
          Get Started!
        </button>
      </Link>
    </div>
  );
}

export default Home;