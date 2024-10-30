import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className='bg-indigo-950 text-slate-300 min-h-screen'>
      <section className='flex flex-col items-center justify-center 
      min-h-screen text-center p-4'>
        <h1 className='text-4xl md:text-6xl font-bold
         text-white mb-4'>
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
    
      <section>
      <h2>
          Create and Manage Your Many Lists
        </h2>
        <p>
          MyShowcase lets you create as many lists as you want, as niche 
          as you want. Allowing you to show off and keep track of 
          your favorite things, you can even explain why theyre your favorite.
        </p>
      </section>

      <section>
        <h2>
          Discover New Favorites
        </h2>
        <p>
          Look at the favorites of other users, and find inspiration from
          trending and popular picks. With tailored suggestions, you may
          discover your next favorite thing!
        </p>
      </section>

      <section>
        <h2>
          Connect and Share
        </h2>
        <p>
          Share your list with friends, other users, or on social.
          Connect with like-minded people and explore shared interests. 
        </p>
      </section>

      <section>
        <h2>
          Dont know where to start?
        </h2>
          <Link>
            <button>
              Start with Discovering
            </button>
          </Link>
      </section>

    </div>
  );
}

export default Home;