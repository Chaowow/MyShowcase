import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaSquareXTwitter } from 'react-icons/fa6';

function Footer() {
  return (
    <footer className='bg-indigo-950 text-slate-300 py-8'>
        <div className='container mx-auto flex flex-col sm:flex-row items-center
        space-y-4 sm:space-y-0 sm:justify-between'>

            <div className='flex space-x-4'>
                <Link to='/about' className='hover:text-white'>About</Link>
                <Link to='/contact' className='hover:text-white'>Contact</Link>
            </div>

            <div className='flex space-x-4'>
                <a href='https://x.com' target='_blank' 
                rel='noopener noreferrer' aria-label='Visit our X page' className='hover:text-white'>
                    <FaSquareXTwitter size={24} />
                </a>
                <a href='https://facebook.com' target='_blank'
                rel='noopener noreferrer' aria-label='Visit our Facebook page' className='hover:text-white'>
                    <FaFacebook size={24} />
                </a>
                <a href='https://instagram.com' target='_blank'
                rel='noopener noreferrer' aria-label='Visit our Instagram page' className='hover:text-white'>
                    <FaInstagram size={24} />
                </a>
            </div>

        </div>
        <p className="text-sm text-center mt-4">
  ©         {new Date().getFullYear()} MyTopShowcase. All rights reserved.
        </p>

    </footer>
  );
}

export default Footer;