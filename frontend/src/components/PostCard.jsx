import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { Card, Image, Button, Badge, Form, ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import { PostContext } from "../context/PostContext";
import { AuthContext } from "../context/AuthContext";
import UserProfileCard from "./UserProfileCard";

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
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <Card.Text className="mt-2">
          {post.name}
          <br />
          {post.title}
        </Card.Text>
        {post.file_path &&
          post.file_mimetype &&
          post.file_mimetype.startsWith("image/") && (
            <Image
              src={`../../backend/${post.file_path}`}
              fluid
              rounded
              className="mb-2"
            />
          )}
        {post.file_path &&
          post.file_mimetype &&
          post.file_mimetype.startsWith("video/") && (
            <video
              src={`../../backend/${post.file_path}`}
              controls
              className="mb-2"
            />
          )}
        <div>
          {post.tags &&
            post.tags.map((tag) => (
              <Badge key={tag} pill bg="secondary" className="me-1">
                {tag}
              </Badge>
            ))}
        </div>
      </Card.Body>
      <Card.Footer className="text-muted d-flex justify-content-between align-items-center">
        <div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleLike(post._id)}
          >
            Like
          </Button>{" "}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleCommentClick}
          >
            Comment
          </Button>
          <span className="ms-2">{post.likesCount} Likes</span>
          <span className="ms-2">{post.commentsCount} Comments</span>
        </div>
        <Link to={`/post/${post._id}`}>View Details</Link>
      </Card.Footer>
      {commentVisible && (
        <Card.Footer>
          <Form onSubmit={handleCommentSubmit}>
            <Form.Group className="mb-0">
              <Form.Control
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={handleCommentChange}
              />
            </Form.Group>
            <div className="text-end mt-2">
              <Button variant="primary" type="submit" size="sm">
                Post Comment
              </Button>
            </div>
          </Form>
        </Card.Footer>
      )}
      {loadingComments && <Card.Footer>Loading comments...</Card.Footer>}
      {errorComments && (
        <Card.Footer>Error loading comments: {errorComments}</Card.Footer>
      )}
      {comments.length > 0 && (
        <Card.Footer>
          <ListGroup variant="flush">
            {comments.map((comment) => (
              <ListGroup.Item key={comment._id}>
                <strong>{comment.author.username}:</strong> {comment.text}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Footer>
      )}
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
