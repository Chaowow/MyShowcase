import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
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
  const [isSelectingAvatar, setIsSelectingAvatar] = useState(false);
  const [newPfp, setNewPfp] = useState(profile?.pfp || '');
  const [pinnedLists, setPinnedLists] = useState([]);
  const [otherLists, setOtherLists] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchData = async () => {
        try {
          const response = await fetch('http://localhost:5000/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              auth0_id: user.sub,
              username: user.nickname || user.name,
              email: user.email
            })
          });

          const data = await response.json();
          setProfile(data)

          const allRes = await fetch(`http://localhost:5000/lists/${data.auth0_id}`);
          const allLists = await allRes.json();

          const pinnedRes = await fetch(`http://localhost:5000/lists/pinned/${data.auth0_id}`);
          const pinned = await pinnedRes.json();
          setPinnedLists(pinned);

          const remaining = allLists.filter(
            (list) => !pinned.some((p) => p.id === list.id)
          );
          setOtherLists(remaining);
        } catch (error) {
          console.error('Error:', error);
        }
      };

      fetchData();
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
      } else {
        console.error('Failed to update username');
      }
    } catch (err) {
      console.error('Error updating username:', err);
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
        console.error('Failed to update profile picture');
      }
    } catch (err) {
      console.error('Error updating profile picture:', err);
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
        alert(err.error);
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
      console.error('Error toggling pin:', err);
    }
  };

  if (isLoading) return <p>Loading...</p>
  if (!isAuthenticated) return <p>Please log in to view your profile.</p>
  if (!profile) return <p>Loading your profile...</p>;

  return (
    <div className='bg-indigo-950 p-6 text-white'>
      <div className='flex items-center gap-4 mb-2'>
        {isEditing ? (
          <>
            <input
              type='text'
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
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
                className='bg-indigo-500 hover:bg-indigo-600 px-2 py-1 mt-2 rounded text-sm'
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

      {pinnedLists.length > 0 && (
        <div className='mt-8'>
          <h3 className='text-xl font-semibold mb-2 text-yellow-300'>⭐ Pinned Lists</h3>
          <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {pinnedLists.map((list) => (
              <li key={list.id} className='bg-indigo-900 p-4 rounded-lg shadow'>
                <div className='flex justify-between items-center mb-4'>
                  <h4 className='text-xl font-bold mb-2 text-white'>{list.title}</h4>
                  <button
                    onClick={() => handleTogglePin(list.id)}
                    className='mt-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded'
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
                      />
                      <div className='flex flex-col justify-center'>
                        <p className='text-white font-bold text-lg'>{list.items[0].title}</p>
                        <p className='text-sm text-slate-400'>#1 Pick</p>
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
                        />
                        <p className='text-white font-semibold text-sm text-center'>{item.title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className='text-sm text-slate-400 mt-4'>
                  Created on {new Date(list.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className='mt-8'>
        <h3 className='text-xl font-semibold mb-2'>Your Lists</h3>

        {otherLists.length == 0 ? (
          <p className='text-slate-400'>You haven't created any lists yet!</p>
        ) : (
          <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {otherLists.map((list) => (
              <li key={list.id} className='bg-indigo-900 p-4 rounded-lg shadow'>
                <div className='flex justify-between items-center mb-4'>
                  <h4 className='text-xl font-bold mb-2 text-white'>{list.title}</h4>
                  {pinnedLists.length < 3 && (
                    <button
                      onClick={() => handleTogglePin(list.id)}
                      className='mt-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded'
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
                      />
                      <div className='flex flex-col justify-center'>
                        <p className='text-white font-bold text-lg'>{list.items[0].title}</p>
                        <p className='text-sm text-slate-400'>#1 Pick</p>
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
                        />
                        <p className='text-white font-semibold text-sm text-center'>{item.title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className='text-sm text-slate-400 mt-4'>
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

export default Profile;