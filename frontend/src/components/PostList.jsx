import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Spinner } from 'react-bootstrap';
import PostCard from './PostCard';
import { Box, Grid2 } from '@mui/material';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);
  console.log("token kaboom", token);
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:5000/api/posts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center mt-5">
        <p>Error: {error}</p>
      </Container>
    );
  }

  return (
    <Box
    sx={{
      p : 5,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Grid2 container spacing={4} sx={{
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {posts.map((post) => (
        <Grid2 item xs={12} sm={6} md={4} lg={4} key={post._id}>
          <PostCard post={post} />
        </Grid2>
      ))}
      {console.log(posts[3])}
    </Grid2>
      </Box>
  );
};

export default PostList;
