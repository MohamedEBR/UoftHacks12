import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from '../context/AuthContext';

function PostDetails() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`);
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error("Error fetching post details:", error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/comments`);
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchPost();
    fetchComments();
  }, [postId]);

  if (!post) {
    return <div>Loading...</div>;
  }

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`/api/posts/like/${postId}`, {
        method: 'PUT',
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setPost(updatedPost);
      } else {
        console.error('Error liking post');
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleUnlike = async (postId) => {
    try {
      const response = await fetch(`/api/posts/unlike/${postId}`, {
        method: 'PUT',
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setPost(updatedPost);
      } else {
        console.error('Error unliking post');
      }
    } catch (error) {
      console.error('Error unliking post:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim()) {
      try {
        const response = await fetch(`/api/posts/${postId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: newComment }),
        });
        const data = await response.json();
        setComments([...comments, data]);
        setNewComment('');
      } catch (error) {
        console.error('Error submitting comment:', error);
      }
    }
  };

  return (
    <div>
      <h1>{post.title}</h1>
      <p>By: {post.author}</p>
      <p>{post.content}</p>
      {post.imageUrl && <img src={post.imageUrl} alt="Post Image" />}
      {user && post.likes.some((like) => like.user === user._id) ? (
        <button onClick={() => handleUnlike(post.id)}>Unlike</button>
      ) : (
        <button onClick={() => handleLike(post.id)}>Like</button>
      )}
      <span>{post.likes.length} Likes</span>
      <div>
        <h3>Comments</h3>
        {comments.map((comment) => (
          <p key={comment.id}>{comment.text}</p>
        ))}
        <input
          type="text"
          placeholder="Add a comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button onClick={handleCommentSubmit}>Post Comment</button>
      </div>
    </div>
  );
}

export default PostDetails;
