import React from 'react';

function About() {
  return (
    <div className='bg-indigo-950 min-h-screen p-6 text-white'>
      <h1 className='text-3xl font-bold text-center mb-10'>
        About MyShowcase
      </h1>

      <hr className='border-t border-indigo-500 my-6 w-3/4 mx-auto'/>

      <h2 className='text-2xl font-semibold text-center mt-4 mb-4'>
        Why MyShowcase?
      </h2>
      
      <p className='text-lg text-center max-w-3xl mx-auto'>
        Inspired by Smosh Game's videos on Shayne guesses. MyShowcase is a platform for users to share their top 5 favorites
        in different categories.
      </p>
      <p className='text-lg text-center max-w-3xl mx-auto mt-4'>
        Whether it's movies, TV shows, books, or video games, our goal is to create a space where users can visually showcase their favorites
        and discover new recommendations.
      </p>
    </div>
  );
}

export default About;