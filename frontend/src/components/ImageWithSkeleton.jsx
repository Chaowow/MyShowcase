import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ImageWithSkeleton = ({ src, alt, className, skeletonClass }) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className={`relative ${className}`}>
            {!loaded && (
                <Skeleton
                    className={`absolute top-0 left-0 w-full h-full rounded ${skeletonClass}`}
                    containerClassName='w-full h-full'
                />
            )}
            <img
                src={src}
                alt={alt}
                className={`w-full h-full object-contain transition-opacity duration-300
                    ease-in-out rounded ${loaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setLoaded(true)}
                onError={() => setLoaded(true)}
            />
        </div>
    );
};

export default ImageWithSkeleton;