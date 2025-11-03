import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin } from 'react-icons/fa6';

function Footer() {
    return (
        <footer role='contentinfo' className='bg-indigo-950 text-slate-300 py-8 shrink-0 min-h-24'>
            <div className='container mx-auto flex flex-col sm:flex-row items-center
            space-y-4 sm:space-y-0 sm:justify-between'>

                <div className='flex space-x-4'>
                    <Link to='/about' className='hover:text-white'>About</Link>
                    <Link to='/contact' className='hover:text-white'>Contact</Link>
                </div>

                <div className="flex space-x-4">
                    <a
                        href="https://github.com/Chaowow/MyShowcase"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                    >
                        <FaGithub size={24} aria-hidden="true" />
                        <span className="sr-only">GitHub repository</span>
                    </a>
                    <a
                        href="https://www.linkedin.com/in/frankie-jose/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                    >
                        <FaLinkedin size={24} aria-hidden="true" />
                        <span className="sr-only">LinkedIn profile</span>
                    </a>
                </div>

            </div>
            <p className="text-sm text-center mt-4">
                © {new Date().getFullYear()} MyTopShowcase. All rights reserved.
            </p>

        </footer>
    );
}

export default Footer;