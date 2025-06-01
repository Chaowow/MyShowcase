import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import placeholder from '../assets/placeholder.jpg'


function PublicProfile() {
  const { username } = useParams();
  const { user, isAuthenticated } = useAuth0();
  const [profile, setProfile] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [pinnedLists, setPinnedLists] = useState([]);
  const [otherLists, setOtherLists] = useState([]);
  const [expandedListIds, setExpandedListIds] = useState([]);

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

        const pinnedRes = await fetch(`http://localhost:5000/lists/pinned/${userData.auth0_id}`);
        const pinned = await pinnedRes.json();
        setPinnedLists(pinned)

        if (user && user.sub !== userData.auth0_id) {
          await fetch(`http://localhost:5000/users/${userData.auth0_id}/views`, {
            method: 'PATCH'
          });

          const likeCheckRes = await fetch(
            `http://localhost:5000/users/${user.sub}/likes/${userData.auth0_id}`
          );
          const likeStatus = await likeCheckRes.json();
          setHasLiked(likeStatus.liked);
        }

        const listRes = await fetch(`http://localhost:5000/lists/${userData.auth0_id}`);
        const listData = await listRes.json();
        setLists(listData);

        const remaining = listData.filter(
          (list) => !pinned.some((p) => p.id === list.id)
        );
        setOtherLists(remaining);
      } catch (err) {
        console.error('Error loading public profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [username, user]);

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
        console.error('Failed to toggle like');
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

   const toggleDescription = (id) => {
    setExpandedListIds((prev) => 
      prev.includes(id) ? prev.filter((listId) => listId !== id) : [...prev, id]
    );
  };

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>User not found.</p>;

  return (
    <div className='bg-indigo-950 p-6 min-h-screen text-white'>
      <h2 className='text-3xl font-bold mb-2'>{profile.username}</h2>

      <img
        src={profile.pfp || placeholder}
        alt={`${profile.username}'s profile`}
        className='w-20 h-20 rounded-full mt-4 object-cover border-2 border-white shadow'
      />

      <p className='text-slate-300 mt-2 mb-2'>Joined {profile?.created_at ? formatJoinDate(profile.created_at) : '...'}</p>

      <p className='text-lg mt-2'>
        <span className='text-indigo-300 font-semibold'>{profile?.views}</span> views ·
        <span className='text-pink-300 font-semibold ml-2'>{profile?.likes}</span> likes
      </p>

      {isAuthenticated && user?.sub !== profile.auth0_id && (
        <button
          onClick={handleLike}
          className={`mt-4 px-4 py-2 ${hasLiked ? 'bg-gray-500 hover:bg-gray-600'
            : 'bg-pink-300 hover:bg-pink-400'} text-white rounded-md transition}`}
        >
          {hasLiked ? '💔 Unlike' : '❤️ Like'}
        </button>
      )}

      {pinnedLists.length > 0 && (
        <div className='mt-6'>
          <h3 className='text-xl font-semibold mb-2 text-yellow-300'>⭐ Pinned Lists</h3>
          {lists.length === 0 ? (
            <p className='text-slate-400'>This user hasn't shared any lists yet.</p>
          ) : (
            <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {pinnedLists.map((list) => (
                <li key={list.id} className='bg-indigo-900 p-4 rounded shadow'>
                  <h4 className='text-xl font-bold mb-2 text-white'>{list.title}</h4>

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

                  {list.description && (
                  <>
                    <button
                      onClick={() => toggleDescription(list.id)}
                      className='text-sm mt-2 text-indigo-300 hover:underline'
                    >
                      {expandedListIds.includes(list.id) ? 'Hide Description' : 'Show Description'}
                    </button>

                    {expandedListIds.includes(list.id) && (
                      <p className='mt-2 text-slate-200'>{list.description}</p>
                    )}
                  </>
                )}

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
      )}

      {otherLists.length > 0 && (
        <div className='mt-8'>
          <h3 className='text-xl font-semibold mb-2'>Other Lists</h3>

          {otherLists.length == 0 ? (
            <p className='text-slate-400'>The user has not created any other list</p>
          ) : (
            <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {otherLists.map((list) => (
                <li key={list.id} className='bg-indigo-900 p-4 rounded-lg shadow'>
                  <h4 className='text-xl font-bold mb-2 text-white'>{list.title}</h4>

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

                  {list.description && (
                  <>
                    <button
                      onClick={() => toggleDescription(list.id)}
                      className='text-sm mt-2 text-indigo-300 hover:underline'
                    >
                      {expandedListIds.includes(list.id) ? 'Hide Description' : 'Show Description'}
                    </button>

                    {expandedListIds.includes(list.id) && (
                      <p className='mt-2 text-slate-200'>{list.description}</p>
                    )}
                  </>
                )}

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
      )}
    </div>
  );
}

export default PublicProfile;
