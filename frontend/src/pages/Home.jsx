import React from 'react';
import { Link } from 'react-router-dom';
import placeholder from '../assets/placeholder.jpg'
import horrorList from '../assets/HorrorMovieList.png';
import animeList from '../assets/AnimeList.png';
import videoGameList from '../assets/videogameList.png';
import demoGif from '../assets/ezgif-shareProfile.gif';


function Home() {
  return (
    <div className='bg-indigo-950 text-slate-300 min-h-screen'>

      {/* About Section */}
      <section className='flex flex-col items-center justify-center 
      min-h-screen text-center p-4'>

        <h1 className='text-4xl md:text-6xl font-bold
         text-white mb-8'>
          Welcome to MyTopShowcase!
        </h1>
        
        <p className='text-lg md:text-2xl max-w-xl mb-8'>
          Create and share lists of your favorite things — from movies and 
          TV shows to books and video games. Build it, personalize it, and 
          show it off!
        </p>

        <Link to="create">
          <button className='bg-indigo-500 text-white px-6 py-3
          rounded-lg text-lg md:text-xl hover:bg-indigo-600'>
            Get Started!
          </button>
        </Link>

      </section>

      {/* Images */}
      <section className='flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4 mb-8'>
        
        <img src={horrorList} alt='Horror List' 
        className='w-full max-w-[900px] h-auto border-2 border-slate-200 object-cover rounded-lg shadow-lg'/>

        <img src={animeList} alt='Anime List' 
        className='w-full max-w-[900px] h-auto border-2 border-slate-200 object-cover rounded-lg shadow-lg'/>

        <img src={videoGameList} alt='Video Game List' 
        className='w-full max-w-[900px] h-auto border-2 border-slate-200 object-cover rounded-lg shadow-lg'/>
        
      </section>

      {/* Feature Overview */}
      <section className='flex flex-col items-center py-12 px-4 text-center mb-12'>

        <h2 className='text-3xl md:text-4xl font-semibold text-white mb-6'>
          Create and Manage Your Many Lists
        </h2>

        <p className='text-lg md:text-xl max-w-3xl'>
          With MyTopShowcase, you can create as many lists as you want — as broad 
          or as niche as you like. Show off your favorites, keep track of them, 
          and add personal notes or descriptions for each list!
        </p>

      </section>

      {/* Discover Section */}
      {/* <section className='flex flex-col items-center py-12 px-4 text-center
      bg-indigo-900'>

        <div className="flex flex-wrap justify-center space-x-4 
        space-y-4 mb-12 sm:space-y-0 sm:space-x-8">
          <img src={placeholder} alt="placeholder" 
          className="w-40 sm:w-48 h-60 sm:h-80 object-cover rounded-lg shadow-lg" />

          <img src={placeholder} alt="placeholder"
           className="w-40 sm:w-48 h-60 sm:h-80 object-cover rounded-lg shadow-lg" />

          <img src={placeholder} alt="placeholder" 
          className="w-40 sm:w-48 h-60 sm:h-80 object-cover rounded-lg shadow-lg" />
        </div>

        <h2 className='text-2xl md:text-4xl font-semibold text-white mb-6'>
          Discover New Favorites
        </h2>

        <p className='text-lg md:text-xl max-w-3xl mb-12'>
          Look at the favorites of other users, and find inspiration from
          trending and popular picks. With tailored suggestions, you may
          discover your next favorite thing!
        </p>

      </section> */}

      {/* Sharing Section */}
      <section className='flex flex-col items-center py-12 px-4 text-center bg-indigo-900'>

        <img src={demoGif} alt='Animated demo showing a user sharing their profile on MyTopShowcase'
          className='w-64 h-auto rounded-lg shadow-lg mb-6' />

        <h2 className='text-2xl md:text-4xl font-semibold text-white mb-6'>
          Connect and Share
        </h2>

        <p className='text-lg md:text-xl max-w-3xl'>
          Share your lists with friends or on social media platforms.
          Connect with like-minded fans and discover new favorites together.
        </p>

      </section>

      {/* CTA */}
      <section className='flex flex-col items-center py-12 px-4 text-center'>

        <h2 className='text-2xl md:text-4xl font-semibold text-white mb-8'>
          Don't know where to start?
        </h2>

        <Link to='create'>
          <button className='bg-indigo-500 text-white px-6 py-3 rounded-lg
          text-lg md:text-xl hover:bg-indigo-600'>
            Start Creating!
          </button>
        </Link>

      </section>

    </div>
  );
}

export default Home;