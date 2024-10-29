import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  const isAuth = false;

  return (
    <header className='bg-indigo-700 shadow-lg p-5'>
        <div className='container mx-auto flex 
        justify-between items-center'>
           <div className=
           'text-6xl font-bold font-mono text-center md:text-left'>
            My Showcase
            {/* Change font later */}
            </div>
        <div className='flex items-center space-x-4'>
          <nav>
            <ul className='flex space-x-4'>
              <li>
                <Link 
                to='/' 
                className='text-gray-950 hover:text-stone-300'
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                to='/about' 
                className='text-gray-950 hover:text-stone-300'
                >
                    About
                </Link>
              </li>
              <li>
                <Link 
                to='discover' 
                className='text-gray-950 hover:text-stone-300'
                >
                  Discover
                </Link>
              </li>

              {/* Conditional Profile link render for now */}
              {isAuth && (
                <li>
                  <Link 
                  to='profile' 
                  className='text-gray-950 hover:text-stone-300'
                  >
                    Profile
                  </Link>
                </li>
              )}
            </ul>
          </nav>

        {/* Temporary Sign In/Sign Out Buttons */}
          {isAuth ? (
            <button 
            className='bg-indigo-500 text-white
            px-4 py-2 rounded-md hover:bg-indigo-600'
            >
              Sign Out
            </button>
          ) : (
            <button 
            className='bg-indigo-500 text-white
            px-4 py-2 rounded-md hover:bg-indigo-600'
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;