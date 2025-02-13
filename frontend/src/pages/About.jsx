import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <div className='bg-indigo-950 min-h-screen p-6 text-white'>
      <h1 className='text-3xl font-bold text-center mb-10'>
        About MyTopShowcase
      </h1>

      <hr className='border-t border-indigo-500 my-8 w-3/4 mx-auto'/>

      <h2 className='text-2xl font-semibold text-center mb-4'>
        Why MyTopShowcase?
      </h2>
      <p className='text-lg text-center max-w-3xl mx-auto'>
        Inspired by Smosh Game's videos on Shayne guesses. MyTopShowcase is a platform for users to share their top 5 favorites
        in different categories.
      </p>
      <p className='text-lg text-center max-w-3xl mx-auto mt-4'>
        Whether it's movies, TV shows, books, or video games, our goal is to create a space where users can visually showcase their favorites
        and discover new recommendations.
      </p>

      <hr className='border-t border-indigo-500 my-8 w-3/4 mx-auto'/>

      <h2 className='text-2xl font-semibold text-center mb-4'>
        How It Works
      </h2>
      <ul className='list-disc text-lg max-w-2xl mx-auto text-center space-y-2'>
        <li>Create a showcase with your top 5 favorites.</li>
        <li>Search for media items (movies, TV shows, books, games) to add.</li>
        <li>Organize and customize your lists as you like.</li>
        <li>Share your lists with others and explore popular showcases.</li>
      </ul>

      <hr className='border-t border-indigo-500 my-8 w-3/4 mx-auto'/>

      <div className='text-center'>
        <p className='text-lg mb-6'>Ready to showcase your top favorites?</p>
        <Link to='/create' className='bg-slate-500 text-white px-4 py-3 rounded-md hover:bg-indigo-600 transition'>
          Get Started
        </Link>
      </div>
    </div>
  );
}

export default About;