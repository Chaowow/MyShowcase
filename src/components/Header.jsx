import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuth = false;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  return (
    <header className='bg-indigo-950 shadow-lg p-5 relative'>
        <div className='container mx-auto flex 
        justify-between items-center'>

           <div className=
           'text-3xl md:text-5xl font-bold font-mono text-white'>
              <Link to='/' className='hover:opacity-90'>
                My Showcase
              </Link>
            {/* Change font later */}
            </div>

            <div className='md:hidden text-white text-2xl cursor-pointer'
            onClick={toggleMenu}>
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </div>

            {isMenuOpen && (
              <div
                className='fixed inset-0 bg-black opacity-50 z-10 md:hidden'
                onClick={toggleMenu}
              ></div>
            )}

          <nav className={`fixed inset-y-0 right-0 z-20 w-2/3 
            bg-indigo-900 p-6 transform ${isMenuOpen ? 'translate-x-0' : 
              'translate-x-full'} md:transform-none md:static md:bg-transparent
              md:w-auto transition-transform duration-300 ease-in-out`
          }>
            <ul className='flex flex-col md:flex-row space-y-4 md:space-y-0 
            md:space-x-6 items-center text-lg'>
              <li>
                <Link 
                to='discover' 
                className='text-slate-300 hover:text-white'
                onClick={toggleMenu}
                >
                  DISCOVER
                </Link>
              </li>
              <li>
                <Link 
                to='signup' 
                className='text-slate-300 hover:text-white'
                onClick={toggleMenu}
                >
                  SIGN UP
                </Link>
              </li>
              <li>
                <Link 
                to='/login' 
                className='text-slate-300 hover:text-white'
                onClick={toggleMenu}
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
                  onClick={toggleMenu}
                  >
                    PROFILE
                  </Link>
                </li>
              )}
            </ul>
          </nav>
      </div>
    </header>
  );
}

export default Header;