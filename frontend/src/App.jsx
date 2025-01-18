import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';
import placeholderImage from './assets/placeholder.jpg';

function App() {
  const [image, setImage] = useState(null);

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImage(URL.createObjectURL(event.target.files[0]));
    }
  };

  return (
    <Container className="text-center mt-5 d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div>
        <h1>My Title</h1>
        <p style={{ marginTop: '100px' }}>This is the description.</p>
        <div style={{ height: '300px', width: '300px', overflow: 'hidden', margin: '0 auto' }}>
          {image ? (
            <img src={image} alt="Selected" style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }} />
          ) : (
            <img src={placeholderImage} alt="Placeholder" style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }} />
          )}
        </div>
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Images and Videos</Form.Label>
          <Form.Control type="file" accept="image/*,video/*" onChange={handleImageChange} />
        </Form.Group>
      </div>
    </Container>
  );
}

export default App;
