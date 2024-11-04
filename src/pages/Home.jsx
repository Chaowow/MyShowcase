import React from 'react';
import { Link } from 'react-router-dom';
import placeholder from '../assets/placeholder.jpg'


function Home() {
  return (
    <div className='bg-indigo-950 text-slate-300 min-h-screen'>

      {/* About Section */}
      <section className='flex flex-col items-center justify-center 
      min-h-screen text-center p-4'>
        <h1 className='text-4xl md:text-6xl font-bold
         text-white mb-8'>
          Welcome to MyShowcase.
        </h1>
        <p className='text-lg md:text-2xl max-w-xl mb-8'>
          Create and track lists of your favorite things, 
          from movies and TV shows to books and video games. 
          Share with your friends.
        </p>
        <Link to="signup">
          <button className='bg-indigo-500 text-white px-6 py-3
          rounded-lg text-lg md:text-xl hover:bg-indigo-600'>
            Get Started!
          </button>
        </Link>
      </section>

      {/* Images */}
      <section className='flex justify-center space-x-10 mb-4'>
        <img src={placeholder} alt='placeholder' 
        className='w-48 h-80 object-cover rounded-lg shadow-lg'/>

        <img src={placeholder} alt='placeholder' 
        className='w-48 h-80 object-cover rounded-lg shadow-lg'/>

        <img src={placeholder} alt='placeholder' 
        className='w-48 h-80 object-cover rounded-lg shadow-lg'/>
        
      </section>

      {/* Feature Overview */}
      <section className='flex flex-col items-center py-28 px-4 text-center'>
        <h2 className='text-3xl md:text-4xl font-semibold text-white mb-6'>
          Create and Manage Your Many Lists
        </h2>
        <p className='text-lg md:text-xl max-w-3xl'>
          MyShowcase let's you create as many lists as you want, as niche 
          as you want. Allowing you to show off and keep track of 
          your favorite things, you can also explain why they're your favorite.
        </p>
      </section>

      {/* Discover Section */}
      <section className='flex flex-col items-center py-16 px-4 text-center
      bg-indigo-900'>
        <h2 className='text-3xl md:text-4xl font-semibold text-white mb-6'>
          Discover New Favorites
        </h2>
        <p className='text-lg md:text-xl max-w-3xl'>
          Look at the favorites of other users, and find inspiration from
          trending and popular picks. With tailored suggestions, you may
          discover your next favorite thing!
        </p>
      </section>

      {/* Sharing Section */}
      <section className='flex flex-col items-center py-16 px-4 text-center'>
        <h2 className='text-3xl md:text-4xl font-semibold text-white mb-6'>
          Connect and Share
        </h2>
        <p className='text-lg md:text-xl max-w-3xl'>
          Share your list with friends, other users, or on social.
          Connect with like-minded people and explore shared interests. 
        </p>
      </section>

      {/* CTA */}
      <section className='flex flex-col items-center py-16 px-4 text-center
      bg-indigo-900'>
        <h2 className='text-3xl md:text-4xl font-semibold text-white mb-12'>
          Dont know where to start?
        </h2>
        <Link to='discover'>
          <button className='bg-indigo-500 text-white px-6 py-3 rounded-lg
          text-lg md:text-xl hover:bg-indigo-600'>
            Start with Discover
          </button>
        </Link>
      </section>

    </div>
  );
}

export default Home;