import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import placeholder from '../assets/placeholder.jpg'


function PublicProfile() {
    const { username } = useParams();
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [profile, setProfile] = useState(null);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPublicProfile = async () => {
            try {
                const userRes = await fetch(`http://localhost:5000/users/username/${username}`);
                if (!userRes.ok) {
                    console.error('User not found');
                    return;
                }

                const userData = await userRes.json();
                setProfile(userData);

                const listRes = await fetch(`http://localhost:5000/lists/${userData.auth0_id}`);
                const listData = await listRes.json();
                setLists(listData);
            } catch (err) {
                console.error('Error loading public profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicProfile();
    }, [username]);

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

    if (loading) return <p>Loading profile...</p>;
    if (!profile) return <p>User not found.</p>;

    return (
        <div className='bg-indigo-950 p-6 min-h-screen text-white'>
          <h2 className='text-3xl font-bold mb-2'>{profile.username}</h2>

          <img 
            src={profile.picture || placeholder}
            alt={`${profile.username}'s profile`}
            className='w-20 rounded-full mt-2'
          />

          <p className='text-slate-300 mt-2 mb-4'>Joined {profile?.created_at ? formatJoinDate(profile.created_at) : '...'}</p>

          <p className='text-lg mt-2'>
            <span className='text-indigo-300 font-semibold'>{profile?.views}</span> views · 
            <span className='text-pink-300 font-semibold ml-2'>{profile?.likes}</span> likes
          </p>

          {isAuthenticated && user?.sub !== profile.auth0_id && (
            <button
              onClick={handleLike}
              className='mt-4 px-4 py-2 bg-pink-300 hover:bg-pink-400 text-white rounded-md transition'
            >
              ❤️ Like
            </button>
          )}
    
          <div className='mt-6'>
            <h3 className='text-xl font-semibold mb-2'>Lists</h3>
            {lists.length === 0 ? (
              <p className='text-slate-400'>This user hasn't shared any lists yet.</p>
            ) : (
              <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {lists.map((list) => (
                  <li key={list.id} className='bg-indigo-900 p-4 rounded shadow'>
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
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
    );
}

export default PublicProfile;
