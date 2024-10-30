import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  const isAuth = false;

  return (
    <header className='bg-indigo-950 shadow-lg p-5'>
        <div className='container mx-auto flex 
        justify-between items-center'>
           <div className=
           'text-6xl font-bold font-mono text-center md:text-left text-white'>
              <Link to='/' className='hover:opacity-90'>
                My Showcase
              </Link>
            {/* Change font later */}
            </div>

        <div className='flex items-center space-x-4'>
          <nav>
            <ul className='flex space-x-8'>
              <li>
                <Link 
                to='discover' 
                className='text-slate-300 hover:text-white'
                >
                  DISCOVER
                </Link>
              </li>
              <li>
                <Link 
                to='signup' 
                className='text-slate-300 hover:text-white'
                >
                  SIGN UP
                </Link>
              </li>
              <li>
                <Link 
                to='/login' 
                className='text-slate-300 hover:text-white'
                >
                    LOG IN
                </Link>
              </li>
              {/* Conditional Profile link render for now */}
              {isAuth && (
                <li>
                  <Link 
                  to='profile' 
                  className='text-slate-300 hover:text-white'
                  >
                    PROFILE
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;