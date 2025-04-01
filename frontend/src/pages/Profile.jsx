import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [profile, setProfile] = useState(null);

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
          
          if (response.ok) {
            setProfile(data);
          } else if (response.status === 409) {
            console.warn('User already exists. Fetching profile...');
            setProfile(data);
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

  if (isLoading) return <p>Loading...</p>
  if (!isAuthenticated) return <p>Please log in to view your profile.</p>

  return (
    <div className='bg-indigo-950 p-6 text-white'>
      <h2 className='text-3xl font-bold'>Welcome, {profile?.username || user.name}!</h2>
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
    </div>
  );
}

export default Profile;