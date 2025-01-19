import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { PostContext } from "../context/PostContext";
import { AuthContext } from "../context/AuthContext";
import { Card, CardHeader, IconButton, CardContent, CardActions, CardMedia, Typography, Button, TextField, Box, Badge, List, ListItem, ListItemText } from '@mui/material';
import { FaHeart, FaComment, FaFileAlt } from 'react-icons/fa'; // Import icons from react-icons

const PostCard = ({ post }) => {
  const { likePost, addComment } = useContext(PostContext);
  const { user } = useContext(AuthContext);
  const [commentVisible, setCommentVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [errorComments, setErrorComments] = useState(null);
  console.log("post has changed", post);
  useEffect(() => {
    const fetchComments = async () => {
      setLoadingComments(true);
      setErrorComments(null);
      try {
        const response = await fetch(
          `http://localhost:5000/api/posts/${post._id}/comments`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch comments: ${response.status}`);
        }
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setErrorComments(error.message);
      } finally {
        setLoadingComments(false);
      }
    };

    if (commentVisible) {
      fetchComments();
    }
  }, [post._id, commentVisible, user?.token]);

  const handleLike = (postId) => {
    likePost(postId);
  };

  const handleCommentClick = () => {
    setCommentVisible(!commentVisible);
  };

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    await addComment(post._id, commentText);
    setCommentText("");
    // Refresh comments after submission
    const response = await fetch(
      `http://localhost:5000/api/posts/${post._id}/comments`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
    const data = await response.json();
    setComments(data);
  };

  if (!post) {
    return <div>Loading post...</div>;
  }
  return (
    <Card sx={{ mb: 3, boxShadow: 3,
      width: {xs: '100%', sm: '100%', md: '300px', lg: '410px'},
      height: {xs: '100%', sm: '100%', md: '525px', lg: '610px'},
    }}>
       <CardHeader
        title={post.name}
        sx={{
      bgcolor: '#C4D9FF',
      color: '#564A97'

        }}
      />
    <CardContent
    sx={{
      mx : 0,
            p : 0
    }}>
      
     
      {post.file_path && post.file_mimetype && post.file_mimetype.startsWith("image/") && (
        <CardMedia
          component="img"
          image={`../../backend/${post.file_path}`}
          alt={post.title}
          // sx={{ mb: 2, borderRadius: 1 }}
        />
      )}
      {post.file_path && post.file_mimetype && post.file_mimetype.startsWith("video/") && (
        <CardMedia
          component="video"
          src={`../../backend/${post.file_path}`}
          controls
          sx={{ mb: 2,
            width: '100%',
            height: '450px',
            borderRadius: 1,
            
           }}
        />
      )}
      <Box
      sx={{
        pl: 3,
      }}>
        {post.tags && post.tags.map((tag) => (
          <Badge key={tag} badgeContent={tag} color="secondary" sx={{ mr: 1 }} />
        ))}
      </Box>
    </CardContent>
    <CardActions sx={{ justifyContent: 'space-between' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            <IconButton onClick={() => handleLike(post._id)}>
              <FaHeart />
            </IconButton>
          </Box>
          <Box>
            <IconButton onClick={handleCommentClick}>
              <FaComment />
            </IconButton>
          </Box>
          <Box>
            <IconButton component={Link} to={`/post/${post._id}`}>
              <FaFileAlt />
            </IconButton>
          </Box>
        </Box>
    </CardActions>
    {/* {commentVisible && (
      <CardContent>
        <Box component="form" onSubmit={handleCommentSubmit}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Write a comment..."
            value={commentText}
            onChange={handleCommentChange}
            sx={{ mb: 2 }}
          />
          <Box sx={{ textAlign: 'right' }}>
            <Button variant="contained" type="submit" size="small">
              Post Comment
            </Button>
          </Box>
        </Box>
      </CardContent>
    )}
    {loadingComments && <CardContent>Loading comments...</CardContent>}
    {errorComments && <CardContent>Error loading comments: {errorComments}</CardContent>}
    {comments.length > 0 && (
      <CardContent>
        <List>
          {comments.map((comment) => (
            <ListItem key={comment._id}>
              <ListItemText
                primary={<strong>{comment.author.username}:</strong>}
                secondary={comment.text}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    )} */}
  </Card>
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    image: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    author: PropTypes.shape({
      avatar: PropTypes.string,
      username: PropTypes.string.isRequired,
      bio: PropTypes.string,
    }).isRequired,
    likesCount: PropTypes.number,
    commentsCount: PropTypes.number,
  }).isRequired,
};

export default PostCard;
