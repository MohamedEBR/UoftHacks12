import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Form, Button } from 'react-bootstrap';
import theme from '../theme';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (response.ok && data.token && data.user) {
        login(data.user, data.token);
        navigate('/feed');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Registration failed');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Form style={{ width: '400px' }} onSubmit={handleSubmit}>
        <h1 className="text-center mb-3">Register</h1>
        <Form.Group className="mb-3" controlId="formBasicUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100" style={{ backgroundColor: theme.primary }}>
          Register
        </Button>
        <div className="text-center mt-3">
          <a href="/login">Already have an account? Login</a>
        </div>
      </Form>
    </div>
  );
}

export default Register;
