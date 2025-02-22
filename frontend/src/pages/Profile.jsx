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
        }  catch (error) {
          console.error('Error:', error);
      } 
    };

    registerOrFetchUser();
  }
}, [isAuthenticated, user]);

  if (isLoading) return <p>Loading...</p>
  if (!isAuthenticated) return <p>Please log in to view your profile.</p>

  return (
    <div className='bg-indigo-950 p-6 text-white'>
      <h2 className='text-3xl font-bold'>Welcome, {profile?.username || user.name}!</h2>
      <img src={user.picture} alt='profile picture' className='w-20 rounded-full mt-4'/>
    </div>
  );
}

export default Profile;