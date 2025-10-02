import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import * as Sentry from '@sentry/react';
import toast from 'react-hot-toast';
import placeholder from '../assets/placeholder.jpg'
import monkey from '../assets/Monkey.png';
import cat from '../assets/Cat.png';
import dog from '../assets/Dog.png';
import owl from '../assets/Owl.png';


function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isSelectingAvatar, setIsSelectingAvatar] = useState(false);
  const [newPfp, setNewPfp] = useState(profile?.pfp || '');
  const [pinnedLists, setPinnedLists] = useState([]);
  const [otherLists, setOtherLists] = useState([]);
  const [expandedListIds, setExpandedListIds] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const createOrGetUser = async (user) => {
    const res = await fetch('http://localhost:5000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth0_id: user.sub,
        username: user.nickname || user.name,
        email: user.email
      })
    });

    if (!res.ok) throw new Error('Failed to create or fetch user');
    return res.json();
  };

  const fetchUserLists = async (auth0_id) => {
    const res = await fetch(`http://localhost:5000/lists/${auth0_id}`);
    if (!res.ok) throw new Error('Failed to fetch lists');
    return res.json();
  };

  const fetchPinnedLists = async (auth0_id) => {
    const res = await fetch(`http://localhost:5000/lists/pinned/${auth0_id}`);
    if (!res.ok) throw new Error('Failed to fetch pinned lists');
    return res.json();
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await createOrGetUser(user);
        setProfile(data)

        const [allLists, pinned] = await Promise.all([
          fetchUserLists(data.auth0_id),
          fetchPinnedLists(data.auth0_id)
        ]);

        setPinnedLists(pinned);

        const remaining = allLists.filter(
          (list) => !pinned.some((p) => p.id === list.id)
        );
        setOtherLists(remaining);

      } catch (err) {
        toast.error('Something went wrong. Please try again later.');
        Sentry.captureException(err);
      } finally {
        setLoadingLists(false);
      }
    };

    if (isAuthenticated && user) {
      fetchProfileData();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (profile?.pfp) {
      setNewPfp(profile.pfp);
    }
  }, [profile]);

  const avatars = [
    { src: monkey, alt: 'Monkey' },
    { src: cat, alt: 'Cat' },
    { src: dog, alt: 'Dog' },
    { src: owl, alt: 'Owl' }
  ];

  const formatJoinDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSaveUsername = async () => {
    setUsernameError('');

    const value = newUsername?.trim() || '';

    if (!/^[A-Za-z0-9_]{3,20}$/.test(value)) {
      toast.error('Username must be 3–20 characters (letters, numbers, underscores).');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/users/${profile.auth0_id}/username`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername })
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setIsEditing(false);
      } else if (response.status === 409) {
        setUsernameError('That username is already taken. Please choose another.');

        setTimeout(() => {
          setUsernameError('');
        }, 4000)
      } else {
        toast.error('Failed to update username.');
      }
    } catch (err) {
      toast.error('An unexpected error occured. Please try again later');
      Sentry.captureException(err);
    }
  };

  const handleSavePfp = async () => {
    try {
      const res = await fetch(`http://localhost:5000/users/${profile.auth0_id}/pfp`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pfp: newPfp })
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setIsSelectingAvatar(false);
      } else {
        toast.error('Failed to update profile picture.');
      }
    } catch (err) {
      toast.error('Error updating profile picture');
      Sentry.captureException(err);
    }
  };

  const handleTogglePin = async (listId) => {
    try {
      const res = await fetch(`http://localhost:5000/lists/pin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_auth0_id: profile.auth0_id,
          list_id: listId
        })
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error("Failed to pin/unpin list.");
        Sentry.captureException(err);
        return;
      }

      const pinnedRes = await fetch(`http://localhost:5000/lists/pinned/${profile.auth0_id}`);
      const pinned = await pinnedRes.json();
      setPinnedLists(pinned);

      const allRes = await fetch(`http://localhost:5000/lists/${profile.auth0_id}`);
      const all = await allRes.json();
      const rest = all.filter((list) => !pinned.some((p) => p.id === list.id));
      setOtherLists(rest);
    } catch (err) {
      toast.error('Error toggling pin');
      Sentry.captureException(err);
    }
  };

  const toggleDescription = (id) => {
    setExpandedListIds((prev) =>
      prev.includes(id) ? prev.filter((listId) => listId !== id) : [...prev, id]
    );
  };

  const handleShareProfile = () => {
    const shareUrl = `${window.location.origin}/user/${profile.username}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success('Profile link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  if (isLoading) return <p>Loading...</p>
  if (!isAuthenticated) return <p>Please log in to view your profile.</p>
  if (!profile) return <p>Loading your profile...</p>;

  return (
    <div className='bg-indigo-950 p-6 text-white'>

      {usernameError && <p className='text-red-400 text-sm mb-4'>{usernameError}</p>}
      <div className='flex items-center gap-4 mb-2'>
        {isEditing ? (
          <>
            <input
              type='text'
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              maxLength={20}
              className='text-black px-2 py-1 rounded'
            />
            <button
              onClick={() => setIsEditing(false)}
              className='bg-gray-500 text-white px-2 py-1 rounded'
            >
              Cancel
            </button>
            <button
              onClick={handleSaveUsername}
              className='bg-green-600 text-white px-2 py-1 rounded'
            >
              Save
            </button>
          </>
        ) : (
          <>
            <h2 className='text-3xl font-bold'>{profile?.username || user.name}</h2>
            {user.sub === profile?.auth0_id && (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setNewUsername(profile?.username || '');
                }}
                className='bg-indigo-600 hover:bg-indigo-700 px-2 py-1 mt-2 rounded text-sm'
              >
                Edit
              </button>
            )}
          </>
        )}
      </div>

      <img
        src={profile?.pfp || user.picture || placeholder}
        alt={`${profile.username}'s profile`}
        onClick={() => setIsSelectingAvatar(!isSelectingAvatar)}
        className='w-20 h-20 rounded-full mt-4 border-2 border-white shadow cursor-pointer hover:opacity-80 transition'
      />

      {isSelectingAvatar && (
        <div className='mt-4'>
          <h4 className='text-lg font-semibold mb-2'>Choose Your Avatar</h4>
          <div className='grid grid-cols-3 sm:grid-cols-4 gap-4'>
            {avatars.map((avatar, idx) => (
              <img
                key={idx}
                src={avatar.src}
                alt={avatar.alt}
                onClick={() => setNewPfp(avatar.src)}
                className={`w-16 h-16 rounded-full cursor-pointer border-4 transition ${newPfp === avatar.src ? 'border-green-300' : 'border-transparent'
                  }`}
              />
            ))}
          </div>

          <div className='mt-3 flex gap-2'>
            <button
              onClick={handleSavePfp}
              className='bg-green-600 text-white px-3 py-1 rounded'
            >
              Save Avatar
            </button>
            <button
              onClick={() => setIsSelectingAvatar(false)}
              className='bg-gray-500 text-white px-3 py-1 rounded'
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <p className='text-slate-300 mt-2 mb-2'>
        Joined {profile?.created_at ? formatJoinDate(profile.created_at) : '...'}
      </p>

      <p className='text-lg mt-2'>
        <span className='text-indigo-300 font-semibold'>{profile?.views}</span> views ·
        <span className='text-pink-300 font-semibold ml-2'>{profile?.likes}</span> likes
      </p>

      <button
        onClick={handleShareProfile}
        className='mt-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded shadow'
      >
        Share Profile 🔗
      </button>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2 text-slate-200">📌 Pinned Lists</h3>

        {loadingLists ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[260px]">
            {[...Array(3)].map((_, i) => (
              <li key={i} className="bg-indigo-900 p-4 rounded-lg shadow animate-pulse h-[220px]" />
            ))}
          </ul>

        ) : pinnedLists.length > 0 ? (

          <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[260px]'>
            {pinnedLists.map((list) => (
              <li key={list.id} className='bg-indigo-900 p-4 rounded-lg shadow min-w-0'>
                <div className='flex justify-between items-center gap-3 mb-4'>
                  <h4 className='flex-1 min-w-0 text-xl font-bold mb-2 text-white line-clamp-2 break-words [hyphens:auto]'>
                    {list.title}
                  </h4>
                  <button
                    onClick={() => handleTogglePin(list.id)}
                    className='shrink-0 mt-2 bg-slate-300 hover:bg-slate-400 text-indigo-900 
                    px-3 py-1 rounded border border-slate-400'
                    aria-label={`Unpin ${list.title}`}
                  >
                    Unpin 📌
                  </button>
                </div>

                <div className='space-y-4'>
                  {list.items[0] && (
                    <div className='flex gap-4 bg-indigo-800 p-4 rounded-lg shadow'>
                      <img
                        src={list.items[0].image || placeholder}
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
                          src={item.image || placeholder}
                          alt={item.title}
                          className='w-full h-32 object-contain rounded mb-2'
                          width='320'
                          height='128'
                          loading='lazy'
                          decoding='async'
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
        ) : (
          <div className='min-h-[260px] bg-indigo-900/40 rounded-lg grid place-items-center'>
            <p className='text-slate-300'>No pinned lists yet.</p>
          </div>
        )}
      </div>

      <div className='mt-8'>
        <h3 className='text-xl font-semibold mb-2'>Lists</h3>

        {loadingLists ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[600px]">
            {[...Array(6)].map((_, i) => (
              <li key={i} className="bg-indigo-900 p-4 rounded-lg shadow animate-pulse h-[220px]" />
            ))}
          </ul>
        ) : otherLists.length == 0 ? (
          <div className='min-h-[600px] bg-indigo-900/40 rounded-lg grid place-items-center text-center p-6'>
            <div>
              <p className='text-slate-300 mb-2'>You haven't created any lists yet.</p>
              <p className='text-slate-300 text-sm'>Start your first list from the Create page!</p>
            </div>
          </div>
        ) : (
          <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[600px]'>
            {otherLists.map((list) => (
              <li key={list.id} className='bg-indigo-900 p-4 rounded-lg shadow min-w-0'>
                <div className='flex justify-between items-center mb-4 gap-3'>
                  <h4 className='flex-1 min-w-0 text-xl font-bold mb-2 text-white line-clamp-2 break-words [hyphens:auto]'>
                    {list.title}
                  </h4>
                  {pinnedLists.length < 3 && (
                    <button
                      onClick={() => handleTogglePin(list.id)}
                      className='shrink-0 mt-2 bg-slate-300 hover:bg-slate-400 text-indigo-900 px-3 py-1 rounded border border-slate-400'
                      aria-label={`Pin ${list.title}`}
                    >
                      Pin 📌
                    </button>
                  )}
                </div>

                <div className='space-y-4'>
                  {list.items[0] && (
                    <div className='flex gap-4 bg-indigo-800 p-4 rounded-lg shadow'>
                      <img
                        src={list.items[0].image || placeholder}
                        alt={list.items[0].title}
                        className='w-24 h-32 object-contain rounded'
                        width="96"
                        height="128"
                        loading="lazy"
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
                          src={item.image || placeholder}
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
    </div >
  );
}

export default Profile;