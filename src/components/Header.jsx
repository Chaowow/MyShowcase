import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  const isAuth = false;

  return (
    <header className='bg-indigo-700 shadow-lg p-5'>
        <div className='container mx-auto flex 
        justify-between items-center'>
           <div className=
           'text-4xl font-bold font-mono'>
            My Showcase
            {/* Change font later */}
            </div>

        <nav>
          <ul>
            <li><Link to='/'>Home</Link></li>
            <li><Link to='/about'>About</Link></li>
            <li><Link to='discover'>Discover</Link></li>

        
            {isAuth && (
              <li><Link to='profile'>Profile</Link></li>
            )}
          </ul>
        </nav>


      </div>
    </header>
  )
}

export default Header