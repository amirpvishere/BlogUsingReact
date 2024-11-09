import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostDescription, setNewPostDescription] = useState('');
  const [newPostTags, setNewPostTags] = useState(''); 
  const [editingPostId, setEditingPostId] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(3);
  const [tagSearch, setTagSearch] = useState('');

  const currentUserId = 'currentUserId';
  const currentUserEmail = localStorage.getItem('email');
  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MTg5YWFlY2FhNWVjNzQ5NDQxMThhNyIsInVzZXJuYW1lIjoicG91cnZhaGFieWFuYmFyeS5hQG5vcnRoZWFzdGVybi5lZHUiLCJpYXQiOjE3Mjk2NjU3MTcsImV4cCI6MTczMTgyNTcxN30._4ikWoi5Ke5VGAX5SQToia07wt0DtvplvdoNy-mEMTs'; // Replace with your actual token

  const fetchPosts = async () => {
    try {
      const response = await fetch('https://smooth-comfort-405104.uc.r.appspot.com/document/findAll/posts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
      }

      const responseJson = await response.json();
      const postData = responseJson.data || [];
      console.log("Fetched Posts Data:", postData);
      setPosts(postData);
      setError(null);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to fetch posts');
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreate = async () => {
    const newPostsData = {
      title: newPostTitle,
      description: newPostDescription,
      tags: newPostTags.split(',').map(tag => tag.trim()), 
      ownerEmail: currentUserEmail,
      ownerId: currentUserId,
      createdAt: new Date().toISOString(), 
    };

    try {
      const response = await fetch('https://smooth-comfort-405104.uc.r.appspot.com/document/createorupdate/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: JSON.stringify(newPostsData),
      });

      if (response.ok) {
        const createdPost = await response.json();
        setNewPostTitle('');
        setNewPostDescription('');
        setNewPostTags(''); 
        setError(null);
        await fetchPosts();
        navigate('/dashboard');
      } else {
        const errorData = await response.text();
        setError(`Failed to create post: ${errorData}`);
        console.error('Error creating post:', errorData);
      }
    } catch (error) {
      setError('Error creating post');
      console.error('Error creating post:', error);
    }
  };

  const handleEdit = (post) => {
    setEditingPostId(post.id || post._id);
    setNewPostTitle(post.title);
    setNewPostDescription(post.description);
    setNewPostTags(post.tags.join(', ')); 
  };

  const handleUpdate = async () => {
    const updatedPostData = {
      id: editingPostId,
      title: newPostTitle,
      description: newPostDescription,
      tags: newPostTags.split(',').map(tag => tag.trim()), 
      ownerEmail: currentUserEmail,
      updatedAt: new Date().toISOString(), 
    };

    try {
      const response = await fetch(`https://smooth-comfort-405104.uc.r.appspot.com/document/updateOne/posts/${editingPostId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: JSON.stringify(updatedPostData),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        const updatedPosts = posts.map((post) =>
          post.id === editingPostId ? updatedPost : post
        );
        setPosts(updatedPosts);
        setEditingPostId(null);
        setNewPostTitle('');
        setNewPostDescription('');
        setNewPostTags(''); 
        setError(null);
        navigate('/dashboard'); 
      } else {
        const errorData = await response.text();
        setError(`Failed to update post: ${errorData}`);
        console.error('Error updating post:', errorData);
      }
    } catch (error) {
      setError('Error updating post');
      console.error('Error updating post:', error);
    }
  };

  const handleDelete = async (postId) => {
    try {
      const response = await fetch(`https://smooth-comfort-405104.uc.r.appspot.com/document/deleteOne/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
      });

      if (response.ok) {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId && post._id !== postId));
        setError(null);
      } else {
        setError('Failed to delete post');
        console.error('Error deleting post:', await response.text());
      }
    } catch (error) {
      setError('Failed to delete post');
      console.error('Error deleting post:', error);
    }
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  

  const filteredPosts = posts.filter(post =>
    post.tags && post.tags.some(tag => tag.toLowerCase().includes(tagSearch.toLowerCase()))
  );

  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleShowMore = (postId) => {
    navigate(`/post/${postId}`); 
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <input
        type="text"
        placeholder="Search Tags"
        value={tagSearch}
        onChange={(e) => setTagSearch(e.target.value)} 
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div>
        <input
          type="text"
          placeholder="Post Title"
          value={newPostTitle}
          onChange={(e) => setNewPostTitle(e.target.value)}
        />
        <input
          placeholder="Post Description"
          value={newPostDescription}
          onChange={(e) => setNewPostDescription(e.target.value)} 
          rows={4}
          style={{ resize: 'vertical' }}
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={newPostTags}
          onChange={(e) => setNewPostTags(e.target.value)} 
        />
        {editingPostId ? (
          <button onClick={handleUpdate}>Update Post</button>
        ) : (
          <button onClick={handleCreate}>Create Post</button>
        )}
      </div>

      {currentPosts.length > 0 ? (
        <div>
          {currentPosts.map((post) => (
            <div key={post.id || post._id} style={{ border: '1px solid black', padding: '10px', margin: '10px' }}>
              <h3>{post.title}</h3>
              <h5>Posted by: {post.ownerEmail}</h5>
              <p>{post.description}</p>
              <p>Tags: {post.tags.join(', ')}</p> 
              <p>Created At: {new Date(post.createdAt).toLocaleString()}</p> 
              <p>Last Updated At: {new Date(post.updatedAt).toLocaleString()}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {post.ownerEmail === currentUserEmail && (
                  <div>
                    <button onClick={() => handleEdit(post)} style={{ marginRight: '10px' }}>Update</button>
                    <button onClick={() => handleDelete(post.id || post._id)}>Delete</button>
                  </div>
                )}
                <button onClick={() => handleShowMore(post.id || post._id)}>Show More</button>
              </div>
            </div>
          ))}
          <div>
            <button onClick={handlePrevPage}>Previous</button>
            
            <span>  {currentPage} of {totalPages}  </span>
            
            <button onClick={handleNextPage}>Next</button>
          </div>
        </div>
      ) : (
        <p>No posts found</p>
      )}
    </div>
  );
};

export default Dashboard;
