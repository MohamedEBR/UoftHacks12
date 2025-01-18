import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from './AuthContext';

const PostContext = createContext();

const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const { token } = useContext(AuthContext);

  const fetchPosts = async (page = 1) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to fetch posts');
        return [];
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  };

  useEffect(() => {
    if (token) {
      fetchPosts().then(data => setPosts(data));
    }
  }, [token]);

  const addPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const updatePost = (updatedPost) => {
    setPosts(posts.map(post => post._id === updatedPost._id ? updatedPost : post));
  };

  const deletePost = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  const likePost = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        console.error('Failed to like post');
      }
      // Optimistically update the like count
      setPosts(posts.map(post =>
        post._id === postId ? { ...post, likesCount: (post.likesCount || 0) + 1 } : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const addComment = async (postId, commentText) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText }),
      });
      if (!response.ok) {
        console.error('Failed to add comment');
      }
      const newComment = await response.json();
      // Update the comments for the specific post
      setPosts(posts.map(post =>
        post._id === postId ? { ...post, comments: [...(post.comments || []), newComment] } : post
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <PostContext.Provider value={{ posts, fetchPosts, addPost, updatePost, deletePost, likePost, addComment }}>
      {children}
    </PostContext.Provider>
  );
};

PostProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { PostContext, PostProvider };
