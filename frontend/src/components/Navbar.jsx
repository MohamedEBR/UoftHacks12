// USELESS FILE DO NOT REMOVE TO AVOID ERROR
import { useState, useEffect } from 'react';
import './Navbar.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import BootstrapNavbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function Navbar() {
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const isLoggedIn = localStorage.getItem('token');

  useEffect(() => {
    if (isLoggedIn) {
      // Fetch profile picture URL from backend
      fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${isLoggedIn}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setProfilePicUrl(data.profilePicUrl))
        .catch((error) => console.error('Error fetching profile:', error));
    }
  }, [isLoggedIn]);

  return (
    <BootstrapNavbar bg="light" expand="lg">
      <Container>
        <BootstrapNavbar.Brand href="/">My App</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="/messages">Messages</Nav.Link>
              <Form className="d-flex">
                <Form.Control
                  type="search"
                  placeholder="Search"
                  className="me-2"
                  aria-label="Search"
                />
                <Button variant="outline-success">Search</Button>
              </Form>
              {isLoggedIn ? (
                <>
                  <Nav.Link>
                    <img
                      src={profilePicUrl}
                      alt="Profile"
                      className="profile-pic"
                      style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                    />
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link href="/login">Sign In</Nav.Link>
                  <Nav.Link href="/register">Sign Up</Nav.Link>
                </>
              )}
               <Nav.Link href="/create-post">Create Post</Nav.Link>
            </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
