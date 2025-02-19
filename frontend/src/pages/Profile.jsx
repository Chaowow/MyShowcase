import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <p>Loading...</p>
  if (!isAuthenticated) return <p>Please log in to view your profile.</p>

  return (
    <div className='bg-indigo-950 p-6 text-white'>
      <h2 className='text-3xl font-bold'>Welcome, {user.name}!</h2>
      <p>Email: {user.email}</p>
      <img src={user.picture} alt='profile pictures' className='w-20 rounded-full mt-4'/>
    </div>
  );
}

export default Profile;