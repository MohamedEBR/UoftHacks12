import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Container, Card, Spinner, Row, Col } from "react-bootstrap";
import PostCard from "./PostCard";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              "x-auth-token": `${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUser(data);
        setPosts(data.posts);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
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

  if (!user) {
    return (
      <Container className="text-center mt-5">Profile not found</Container>
    );
  }
  console.log("sfdffes, ", posts);

  return (
    <Container className="mt-5">
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>{user.username}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            {user.email}
          </Card.Subtitle>
          {user.bio && <Card.Text>{user.bio}</Card.Text>}
        </Card.Body>
      </Card>

      <h3>Your Posts</h3>
      <Row xs={1} md={2} lg={3} className="g-4">
        {posts.map((post) => (
          <Col key={post._id}>
            <PostCard post={post} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default UserProfile;
