import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Comment = ({ comment, onReply, level = 0 }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  if (!comment || !comment.content) {
    return null;
  }

  const handleSubmitReply = () => {
    onReply(comment._id, replyContent, comment.ownerEmail);
    setReplyContent('');
    setIsReplying(false);
  };

  return (
    <div style={{ marginLeft: `${level * 20}px` }}>
      <div style={{ 
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <p style={{ fontWeight: 500 }}>{comment.ownerEmail}</p>
        <p style={{ marginTop: '8px', color: '#666' }}>{comment.content}</p>
        <p style={{ 
          fontSize: '0.875rem',
          color: '#999',
          marginTop: '8px'
        }}>
          {new Date().toLocaleString()}
        </p>
        
        <button onClick={() => setIsReplying(!isReplying)}>Reply</button>
        
        {isReplying && (
          <div style={{ marginTop: '16px' }}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
            <button onClick={handleSubmitReply}>Submit</button>
            <button onClick={() => setIsReplying(false)}>Cancel</button>
          </div>
        )}
        
        {comment.replies && Array.isArray(comment.replies) && comment.replies.map(reply => (
          <Comment
            key={reply._id}
            comment={reply}
            onReply={onReply}
            level={level + 1}
          />
        ))}
      </div>
    </div>
  );
};

const PostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MTg5YWFlY2FhNWVjNzQ5NDQxMThhNyIsInVzZXJuYW1lIjoicG91cnZhaGFieWFuYmFyeS5hQG5vcnRoZWFzdGVybi5lZHUiLCJpYXQiOjE3Mjk2NjU3MTcsImV4cCI6MTczMTgyNTcxN30._4ikWoi5Ke5VGAX5SQToia07wt0DtvplvdoNy-mEMTs';
  const ownerEmail = localStorage.getItem('email');

  const fetchPostDetails = async () => {
    try {
      const response = await fetch(`https://smooth-comfort-405104.uc.r.appspot.com/document/findOne/posts/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
      });

      if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);

      const responseJson = await response.json();
      setPost(responseJson.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching post details:', error);
      setError('Failed to fetch post details');
      setPost(null);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`https://smooth-comfort-405104.uc.r.appspot.com/document/findAll/posts-comments`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
      });
      
      if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);
      
      const data = await response.json();
      const postComments = data.data.filter(comment => comment.postId === id) || [];
      setComments(postComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`https://smooth-comfort-405104.uc.r.appspot.com/document/createorupdate/posts-comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: JSON.stringify({
          postId: id,
          content: newComment,
          ownerEmail, // Only set ownerEmail when creating a new comment
        }),
      });

      if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);

      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleReply = async (parentId, content, existingOwnerEmail) => {
    if (!content.trim()) return;

    try {
      const response = await fetch(`https://smooth-comfort-405104.uc.r.appspot.com/document/createorupdate/posts-comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: JSON.stringify({
          postId: id,
          content,
          parentId,
          ownerEmail: existingOwnerEmail || ownerEmail, // Use the existing owner's email if it exists
        }),
      });

      if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);

      fetchComments();
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPostDetails();
      fetchComments();
    }
  }, [id]);

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!post) {
    return <p>Loading post...</p>;
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px' }}>
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Title</h1>
        <h2>{post.title}</h2>
        <hr style={{ margin: '16px 0' }} />
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Description</h2>
        <h3>{post.description}</h3>
        <hr style={{ margin: '16px 0' }} />
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Tags</h2>
        <p>{post.tags}</p>
        <hr style={{ margin: '16px 0' }} />
        
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>Posted By</h3>
        <p>{post.ownerEmail}</p>
        <hr style={{ margin: '16px 0' }} />
        
        <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>Created At</h4>
        <p>{new Date(post.createdAt).toLocaleString()}</p>
        <hr style={{ margin: '16px 0' }} />
        
        <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>Last Updated At</h4>
        {post.updatedAt && <p>{new Date(post.updatedAt).toLocaleString()}</p>}
      </div>

      <div style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>Comments</h2>
        
        <div style={{ marginBottom: '24px' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
          <button onClick={handleAddComment}>Add Comment</button>
        </div>

        <div>
          {comments && comments.length > 0 ? (
            comments.map(comment => (
              <Comment
                key={comment._id}
                comment={comment}
                onReply={handleReply}
              />
            ))
          ) : (
            <p>No comments yet</p>
          )}
        </div>
      </div>

      <button onClick={() => navigate('/dashboard')}>Back</button>
    </div>
  );
};

export default PostDetail;
