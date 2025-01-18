import PropTypes from 'prop-types';
import { Card, Image } from 'react-bootstrap';

const UserProfileCard = ({ user }) => {
  if (!user) {
    return <div>Loading user information...</div>;
  }

  return (
    <Card className="shadow-sm">
      <Card.Body className="d-flex align-items-center">
        <Image
          src={user.avatar || 'https://via.placeholder.com/150'}
          alt="User Avatar"
          roundedCircle
          width={50}
          height={50}
          className="me-3"
        />
        <div>
          <Card.Title className="mb-1">{user.username}</Card.Title>
          <Card.Subtitle className="text-muted">{user.bio}</Card.Subtitle>
        </div>
      </Card.Body>
    </Card>
  );
};

UserProfileCard.propTypes = {
  user: PropTypes.shape({
    avatar: PropTypes.string,
    username: PropTypes.string.isRequired,
    bio: PropTypes.string,
  }).isRequired,
};

export default UserProfileCard;
