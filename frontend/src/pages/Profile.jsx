import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [lists, setLists] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const registerOrFetchUser = async () => {
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
          
          if (response.ok || response.status === 409) {
            setProfile(data);

            const listRes = await fetch(`http://localhost:5000/lists/${data.auth0_id}`);
            const listsData = await listRes.json();
            setLists(listsData);
          } else {
            console.error('Error registering user:', data);
          }

          await fetch(`http://localhost:5000/users/${user.sub}/views`, {
            method: 'PATCH'
          });

        }  catch (error) {
          console.error('Error:', error);
      } 
    };

      registerOrFetchUser();
    }
  }, [isAuthenticated, user]);

  const formatJoinDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`http://localhost:5000/users/${profile.auth0_id}/likes`, {
        method: 'PATCH'
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setProfile(updatedUser);
      } else {
        console.error('Failed to like profile');
      }
    } catch (err) {
      console.error('Error sending like:', err);
    }
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

  if (isLoading) return <p>Loading...</p>
  if (!isAuthenticated) return <p>Please log in to view your profile.</p>

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

      <p className='text-slate-300 mt-2 mb-4'>
        Joined {profile?.created_at ? formatJoinDate(profile.created_at) : '...'}
      </p>

      <p className='text-lg mt-2'>
        <span className='text-indigo-300 font-semibold'>{profile?.views}</span> views · 
        <span className='text-pink-300 font-semibold ml-2'>{profile?.likes}</span> likes
      </p>

      <img src={user.picture} alt='profile picture' className='w-20 rounded-full mt-4'/>

      {isAuthenticated && profile && user.sub !== profile.auth0_id && (
        <button
          onClick={handleLike}
          className='mt-4 px-4 py-2 bg-pink-300 hover:bg-pink-400 text-white rounded-md transition'
        >
          ❤️ Like
        </button>
      )}

      <div className='mt-6'>
        <h3 className='text-xl font-semibold mb-2'>Your Lists</h3>

        {lists.length == 0 ? (
          <p className='text-slate-400'>You haven't created any lists yet!</p>
        ) : (
          <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {lists.map((list) => (
              <li key={list.id} className='bg-indigo-900 p-4 rounded-lg shadow'>
                <h4 className='text-xl font-bold mb-2 text-white'>{list.title}</h4>

                <div className='space-y-3'>
                  {list.items.map((item, index) => (
                    <div key={index} className='flex gap-4 bg-indigo-800 p-3 rounded-lg'>
                      <img 
                        src={item.image || 'https://via.placeholder.com/100x150?text=No+Image'}
                        alt={item.title}
                        className='w-20 h-28 object-contain rounded-md'
                      />
                      <div>
                        <p className='text-white font-semibold'>{item.title}</p>
                      </div>
                    </div>
                  ))}
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