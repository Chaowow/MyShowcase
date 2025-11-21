import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react'
import * as Sentry from '@sentry/react';
import toast from 'react-hot-toast';
import placeholder from '../assets/placeholder.jpg';
import { proxied } from '../utils/img';


function PublicProfile() {
  const { username } = useParams();
  const { user, isAuthenticated } = useAuth0();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [pinnedLists, setPinnedLists] = useState([]);
  const [otherLists, setOtherLists] = useState([]);
  const [expandedListIds, setExpandedListIds] = useState([]);
  const [viewIncremented, setViewsIncremented] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);

  const fetchUserData = async (username) => {
    const res = await fetch(`http://localhost:5000/users/username/${username}`);
    if (!res.ok) throw new Error('User not found');
    return res.json();
  };

  const fetchPinnedLists = async (auth0_id) => {
    const res = await fetch(`http://localhost:5000/lists/pinned/${auth0_id}`);
    if (!res.ok) throw new Error('Failed to fetch pinned lists');
    return res.json();
  };

  const fetchLists = async (auth0_id) => {
    const res = await fetch(`http://localhost:5000/lists/${auth0_id}`);
    if (!res.ok) throw new Error('Failed to fetch lists');
    return res.json();
  };

  const incrementProfileView = async (auth0_id) => {
    const res = await fetch(`http://localhost:5000/users/${auth0_id}/views`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to increment profile view count');
  };

  const fetchLikeStatus = async (viewerId, profileId) => {
    const res = await fetch(`http://localhost:5000/users/${viewerId}/likes/${profileId}`);
    if (!res.ok) throw new Error('Failed to check like status');
    return res.json();
  };


  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        setLoadingLists(true);

        const userData = await fetchUserData(username);
        setProfile(userData);

        const pinned = await fetchPinnedLists(userData.auth0_id);
        setPinnedLists(pinned)

        const allLists = await fetchLists(userData.auth0_id);

        const remaining = allLists.filter(
          (list) => !pinned.some((p) => p.id === list.id)
        );
        setOtherLists(remaining);

        if (user && user.sub !== userData.auth0_id && !viewIncremented) {

          await incrementProfileView(userData.auth0_id);
          setViewsIncremented(true);

          const likeStatus = await fetchLikeStatus(user.sub, userData.auth0_id);
          setHasLiked(likeStatus.liked);
        }

      } catch (err) {
        toast.error('Error loading profile.');
        Sentry.captureException(err);
      } finally {
        setLoading(false);
        setLoadingLists(false);
      }
    };

    fetchPublicProfile();
  }, [username, user, viewIncremented]);

  const formatJoinDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLike = async () => {
    if (!user || !profile) return;

    try {
      const res = await fetch(`http://localhost:5000/users/${profile.auth0_id}/likes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liker_auth0_id: user.sub })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setProfile(updatedUser);
        setHasLiked(!hasLiked);
      } else {
        toast.error('Failed to toggle like.');
      }
    } catch (err) {
      toast.error('Error toggling like.');
      Sentry.captureException(err);
    }
  };

  const toggleDescription = (id) => {
    setExpandedListIds((prev) =>
      prev.includes(id) ? prev.filter((listId) => listId !== id) : [...prev, id]
    );
  };


  return (
    <div className="bg-indigo-950 p-6 min-h-screen text-white">

      {loading ? (
        <div className="animate-pulse">
          <div className="h-10 w-48 bg-indigo-900 rounded mb-2" />
          <div className="w-20 h-20 mt-4 rounded-full bg-indigo-900 border-2 border-white shadow" />
          <div className="h-4 w-64 bg-indigo-900 rounded mt-2 mb-2" />
          <div className="h-5 w-40 bg-indigo-900 rounded" />
          <div className="h-9 w-32 bg-indigo-900 rounded mt-4" />
        </div>
      ) : profile ? (
        <>
          <h2 className='text-3xl font-bold mb-2'>{profile.username}</h2>

          <img
            src={profile?.pfp || user.picture || placeholder}
            alt={`${(profile.username || user?.name || 'User')}'s profile`}
            width='80'
            height='80'
            loading='eager'
            fetchPriority='high'
            decoding='async'
            className='w-20 h-20 rounded-full mt-4 border-2 border-white shadow'
          />

          <p className='text-slate-300 mt-2 mb-2'>
            Joined {profile?.created_at ? formatJoinDate(profile.created_at) : '...'}
          </p>

          <p className='text-lg mt-2'>
            <span className='text-indigo-300 font-semibold'>{profile?.views}</span> views ·
            <span className='text-pink-300 font-semibold ml-2'>{profile?.likes}</span> likes
          </p>

          {isAuthenticated && user?.sub !== profile.auth0_id && (
            <button
              onClick={handleLike}
              className={`mt-4 px-4 py-2 ${hasLiked ? 'bg-gray-500 hover:bg-gray-600' : 'bg-pink-300 hover:bg-pink-400'
                } text-white rounded-md transition`}
            >
              {hasLiked ? '💔 Unlike' : '❤️ Like'}
            </button>
          )}
        </>
      ) : (
        <p>User not found.</p>
      )}

      <div className='mt-8'>
        <h3 className='text-xl font-semibold mb-2 text-slate-200'>📌 Pinned Lists</h3>

        {loadingLists ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[260px]">
            {[...Array(3)].map((_, i) => (
              <li key={i} className="bg-indigo-900 p-4 rounded-lg shadow animate-pulse min-w-0" >

                <div className='h-10 w-4/5 bg-indigo-800 rounded mb-2' />

                <div className='flex gap-4 bg-indigo-800 p-4 rounded-lg mb-4'>
                  <div className='w-24 h-32 bg-indigo-700 rounded' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-5 w-2/3 bg-indigo-700 rounded' />
                    <div className='h-4 w-1/3 bg-indigo-700 rounded' />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className='bg-indigo-800 p-3 rounded-lg'>
                      <div className='w-full h-32 bg-indigo-700 rounded mb-2' />
                      <div className='h-4 w-4/5 mx-auto bg-indigo-700 rounded' />
                    </div>
                  ))}
                </div>

                <div className="h-4 w-1/2 bg-indigo-800 rounded mt-4" />
              </li>
            ))}
          </ul>

        ) : pinnedLists.length > 0 ? (
          <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[260px]'>
            {pinnedLists.map((list) => (
              <li key={list.id} className='bg-indigo-900 p-4 rounded shadow min-w-0'>
                <h4 className='flex-1 min-w-0 text-xl font-bold mb-2 text-white line-clamp-2 
                break-words [hyphens:auto]'>
                  {list.title}
                </h4>

                <div className='space-y-4'>
                  {list.items[0] && (
                    <div className='flex gap-4 bg-indigo-800 p-4 rounded-lg shadow'>
                      <img
                        src={proxied(list.items[0].image)}
                        alt={list.items[0].title}
                        className='w-24 h-32 object-contain rounded'
                        width='96'
                        height='128'
                        loading='lazy'
                        decoding='async'
                      />
                      <div className='flex flex-col justify-center'>
                        <p className='text-white font-bold text-lg'>{list.items[0].title}</p>
                        <p className='text-sm text-slate-300'>#1 Pick</p>
                      </div>
                    </div>
                  )}

                  <div className='grid grid-cols-2 gap-4'>
                    {list.items.slice(1).map((item, index) => (
                      <div key={index} className='bg-indigo-800 p-3 rounded-lg shadow'>
                        <img
                          src={proxied(item?.image)}
                          alt={item.title}
                          className='w-full h-32 object-contain rounded mb-2'
                          width='320'
                          height='128'
                          loading='lazy'
                          decoding='async'
                        />
                        <p className='text-white font-semibold text-sm text-center line-clamp-2 
                        break-words [hyphens:auto]'>
                          {item.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {list.description && (
                  <>
                    <button
                      onClick={() => toggleDescription(list.id)}
                      className='text-sm mt-2 text-indigo-200 hover:underline'
                    >
                      {expandedListIds.includes(list.id) ? 'Hide Description' : 'Show Description'}
                    </button>

                    {expandedListIds.includes(list.id) && (
                      <p className='mt-2 text-slate-200'>{list.description}</p>
                    )}
                  </>
                )}

                <p className='text-sm text-slate-300 mt-4'>
                  Created on {new Date(list.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className='min-h-[260px] bg-indigo-900/40 rounded-lg grid place-items-center'>
            <p className='text-slate-300'>No pinned lists yet.</p>
          </div>
        )}
      </div>

      <div className='mt-8'>
        <h3 className='text-xl font-semibold mb-2'>Lists</h3>

        {loadingLists ? (
          <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[600px]'>
            {[...Array(6)].map((_, i) => (
              <li key={i} className="bg-indigo-900 p-4 rounded-lg shadow animate-pulse min-w-0" >

                <div className='h-10 w-4/5 bg-indigo-800 rounded mb-2' />

                <div className='flex gap-4 bg-indigo-800 p-4 rounded-lg mb-4'>
                  <div className='w-24 h-32 bg-indigo-700 rounded' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-5 w-2/3 bg-indigo-700 rounded' />
                    <div className='h-4 w-1/3 bg-indigo-700 rounded' />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className='bg-indigo-800 p-3 rounded-lg'>
                      <div className='w-full h-32 bg-indigo-700 rounded mb-2' />
                      <div className='h-4 w-4/5 mx-auto bg-indigo-700 rounded' />
                    </div>
                  ))}
                </div>

                <div className="h-4 w-1/2 bg-indigo-800 rounded mt-4" />
              </li>
            ))}
          </ul>
        ) : otherLists.length === 0 ? (
          <div className='min-h-[600px] bg-indigo-900/40 rounded-lg grid place-items-center text-center p-6'>
            <div>
              <p className='text-slate-300 mb-2'>This user hasn't created any lists yet.</p>
              <p className='text-slate-300 text-sm'>Check back later!</p>
            </div>
          </div>
        ) : (
          <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[600px]'>
            {otherLists.map((list) => (
              <li key={list.id} className='bg-indigo-900 p-4 rounded-lg shadow min-w-0'>
                <h4 className='flex-1 min-w-0 text-xl font-bold mb-2 text-white line-clamp-2 break-words [hyphens:auto]'>
                  {list.title}
                </h4>

                <div className='space-y-4'>
                  {list.items[0] && (
                    <div className='flex gap-4 bg-indigo-800 p-4 rounded-lg shadow'>
                      <img
                        src={proxied(list.items[0].image)}
                        alt={list.items[0].title}
                        className='w-24 h-32 object-contain rounded'
                        width="96"
                        height="128"
                        loading='lazy'
                        decoding="async"
                      />
                      <div className='flex flex-col justify-center'>
                        <p className='text-white font-bold text-lg line-clamp-2 break-words [hyphens:auto]'>
                          {list.items[0].title}
                        </p>
                        <p className='text-sm text-slate-300'>#1 Pick</p>
                      </div>
                    </div>
                  )}

                  <div className='grid grid-cols-2 gap-4'>
                    {list.items.slice(1).map((item, index) => (
                      <div key={index} className='bg-indigo-800 p-3 rounded-lg shadow min-w-0'>
                        <img
                          src={proxied(item?.image)}
                          alt={item.title}
                          className='w-full h-32 object-contain rounded mb-2'
                          width="320"
                          height="128"
                          loading="lazy"
                          decoding="async"
                        />
                        <p className='text-white font-semibold text-sm text-center line-clamp-2 break-words [hyphens:auto]'>
                          {item.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {list.description && (
                  <>
                    <button
                      onClick={() => toggleDescription(list.id)}
                      className='text-sm mt-2 text-indigo-200 hover:underline'
                    >
                      {expandedListIds.includes(list.id) ? 'Hide Description' : 'Show Description'}
                    </button>

                    {expandedListIds.includes(list.id) && (
                      <p className='mt-2 text-slate-200'>{list.description}</p>
                    )}
                  </>
                )}

                <p className='text-sm text-slate-300 mt-4'>
                  Created on {new Date(list.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PublicProfile;
