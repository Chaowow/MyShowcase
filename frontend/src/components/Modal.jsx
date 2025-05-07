import React from 'react';

function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center 
        justify-center z-50'>

            {/* Modal Content */}
            <div className='bg-white w-full max-w-md max-h-[80vh] overflow-y-auto rounded-lg 
            shadow-lg p-6 relative'>
                <button
                    onClick={onClose}
                    className='absolute top-4 right-4 text-gray-600 hover:text-black'
                >
                    ✖
                </button>

                {children}
            </div>
        </div>
    );
}

export default Modal;