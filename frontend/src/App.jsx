import { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';
import PostList from './components/PostList';
import PostDetails from './components/PostDetails';
import PostForm from './components/PostForm';
import UserProfile from './components/UserProfile';
import PrivateRoute from './components/PrivateRoute';
import { AuthContext } from './context/AuthContext';
import { PostProvider } from './context/PostContext';
import { Container } from 'react-bootstrap';

function App() {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <Router>
      <Header className="bg-light" />
      <Container>
        <PostProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={isLoggedIn ? <Navigate to="/feed" /> : <Navigate to="/login" />} />
            <Route path="/feed" element={<PrivateRoute><PostList /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
            <Route path="/post/:id" element={<PrivateRoute><PostDetails /></PrivateRoute>} />
            <Route path="/create-post" element={<PrivateRoute><PostForm /></PrivateRoute>} />
          </Routes>
        </PostProvider>
      </Container>
    </Router>
  );
}

export default App;
