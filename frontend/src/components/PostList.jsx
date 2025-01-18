import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Spinner, Row, Col } from 'react-bootstrap';
import PostCard from './PostCard';
import { useNavigate } from 'react-router-dom';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/api/posts', {
          headers: {
            'Authorization': `Bearer ${token}`,
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
  }, [token, navigate]);

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
    <Container className="mt-5">
      <h2>Feed</h2>
      <Row xs={1} md={2} lg={3} className="g-4">
        {posts.map(post => (
          <Col key={post._id}>
            <PostCard post={post} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default PostList;
