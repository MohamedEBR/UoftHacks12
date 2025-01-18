import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import placeholderImage from './assets/placeholder.jpg';

function App() {


  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImage(URL.createObjectURL(event.target.files[0]));
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/upload', { // Backend runs on port 5000
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert("File uploaded successfully!");
      } else {
        alert("File upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file.");
    }
  };

  return (
    <Container className="text-center mt-5 d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div>
        <h1>My Title</h1>
        <p style={{ marginTop: '100px' }}>This is the description.</p>
        <div style={{ height: '300px', width: '300px', overflow: 'hidden', margin: '0 auto' }}>
          
          {/* #TODO: After upload, updated Image needs to be displayed */}
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
        <Button variant="primary" onClick={handleUpload}>Upload</Button>
      </div>
    </Container>
  );
}

export default App;
