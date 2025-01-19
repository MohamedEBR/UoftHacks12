import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';

const UserProfileCard = ({ user }) => {
  return (
    <Card className="mb-2">
      <Card.Body className="d-flex align-items-center">
        {user && user.avatar && (
          <img
            src={`http://localhost:5000/${user.avatar}`}
            alt="User Avatar"
            className="rounded-circle me-2"
            width="30"
            height="30"
          />
        )}
        <div>
          <Card.Title className="mb-0">
            {user ? user.username : 'Unknown User'}
          </Card.Title>
          {user && user.bio && <Card.Subtitle className="text-muted">{user.bio}</Card.Subtitle>}
        </div>
      </Card.Body>
    </Card>
  );
};

UserProfileCard.propTypes = {
  user: PropTypes.shape({
    avatar: PropTypes.string,
    username: PropTypes.string,
    bio: PropTypes.string,
  }),
};

export default UserProfileCard;
