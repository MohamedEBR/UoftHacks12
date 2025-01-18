import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';

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
        {image && <img src={image} alt="Selected" style={{ maxWidth: '300px', maxHeight: '300px' }} />}
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Images and Videos</Form.Label>
          <Form.Control type="file" accept="image/*,video/*" onChange={handleImageChange} />
        </Form.Group>
      </div>
    </Container>
  );
}

export default App;
