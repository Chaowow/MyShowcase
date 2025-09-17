import React from 'react';
import ImageWithSkeleton from './ImageWithSkeleton';

const MediaCard = ({
    imageSrc,
    alt,
    title,
    subtitle,
    description,
    platforms,
    onAdd,
    imageClassName = 'sm:w-48 md:w-64 lg:w-full h-48 sm:h-64 md:h-72 lg:h-80 object-contain mb-4 rounded'
}) => {
    return (
        <div className='bg-indigo-900/75 sm:p-6 rounded shadow flex flex-col items-center text-center'>
            {imageSrc && (
                <ImageWithSkeleton
                    src={imageSrc}
                    alt={alt}
                    className={imageClassName}
                    skeletonClass='bg-slate-600'
                    loading="lazy"
                    referrerPolicy="no-referrer"
                />
            )}

            <h4 className='text-xl font-semibold text-slate-100'>
                {title}
            </h4>

            <h5 className='text-sm text-slate-300 mb-2'>
                {subtitle}
            </h5>

            {platforms && (
                <p className='text-slate-300 mb-2'>
                    {platforms}
                </p>
            )}

            {description && (
                <p className='text-sm text-slate-400 flex-1'>
                    {description}
                </p>
            )}

            <button
                onClick={onAdd}
                className='bg-indigo-500 px-4 py-2 rounded text-white hover:bg-indigo-600 mt-4 w-full'
            >
                Add to List
            </button>
        </div>
    );
};

export default MediaCard;