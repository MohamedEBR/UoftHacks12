import { useState, useContext, useRef } from 'react';
import { Form, Button, Image } from 'react-bootstrap';
import { PostContext } from '../context/PostContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Dropzone from 'react-dropzone';


const PostForm = () => {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null); // state for storing actual image
  const [previewSrc, setPreviewSrc] = useState(''); // state for storing previewImage
  const [state, setState] = useState({
    title: '',
    description: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isPreviewAvailable, setIsPreviewAvailable] = useState(false); // state to show preview only for images
  const dropRef = useRef(); // React ref for managing the hover state of droppable area
  const [tags, setTags] = useState('');
  const { addPost } = useContext(PostContext);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleInputChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.value
    });
  };

  const onDrop = (files) => {
    const [uploadedFile] = files;
    setFile(uploadedFile);
  
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewSrc(fileReader.result);
    };
    fileReader.readAsDataURL(uploadedFile);
    setIsPreviewAvailable(uploadedFile.name.match(/\.(jpeg|jpg|png)$/));
    dropRef.current.style.border = '2px dashed #e9ebeb';
};


  const handleTagsChange = (e) => {
    setTags(e.target.value);
  };
  const updateBorder = (dragState) => {
    if (dragState === 'over') {
      dropRef.current.style.border = '2px solid #000';
    } else if (dragState === 'leave') {
      dropRef.current.style.border = '2px dashed #e9ebeb';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const { title, content, tags } = state;
      if (title.trim() !== '' && content.trim() !== '' && tags.trim() !== '') {
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('title', title);
          formData.append('content', content);
          formData.append('tags', tags);
        
          const response = await fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: {
              'x-auth-token': token,
            },
            body: formData,
        });

        const data = await response.json();
        
        if (response.ok) {
          console.log('Post created successfully', data);
          addPost(data); // Update PostContext with the new post
          navigate('/feed'); // Redirect to feed after successful post
      } else {
          console.error('Failed to create post', data);
          alert(data.errors?.[0]?.msg || 'Failed to create post');
      }

        } else {
          setErrorMsg('Please select a file to add.');
        }
      } else {
        setErrorMsg('Please enter all the field values.');
      }
    } catch (error) {
      error.response && setErrorMsg(error.response.data);
    }
  };
        

        
      
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="title">
              <Form.Control
                type="text"
                name="title"
                value={state.title || ''}
                placeholder="Enter title"
                onChange={handleInputChange}
              />
      </Form.Group>

      <Form.Group className="mb-3" controlId="content">
        <Form.Label>Content</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="What's on your mind?"
          value={state.content}
          onChange={handleInputChange}
        />
      </Form.Group>

      <div className="upload-section">
  <Dropzone onDrop={onDrop}
  onDragEnter={() => updateBorder('over')}
  onDragLeave={() => updateBorder('leave')}
  >
    {({ getRootProps, getInputProps }) => (
      <div {...getRootProps({ className: 'drop-zone' })} ref={dropRef}>
        <input {...getInputProps()} />
        <p>Drag and drop a file OR click here to select a file</p>
        {file && (
          <div>
            <strong>Selected file:</strong> {file.name}
          </div>
        )}
      </div>
    )}
  </Dropzone>
  {previewSrc ? (
    isPreviewAvailable ? (
      <div className="image-preview">
        <img className="preview-image" src={previewSrc} alt="Preview" />
      </div>
    ) : (
      <div className="preview-message">
        <p>No preview available for this file</p>
      </div>
    )
  ) : (
    <div className="preview-message">
      <p>Image preview will be shown here after selection</p>
    </div>
  )}
</div>

      <Form.Group className="mb-3" controlId="tags">
        <Form.Label>Tags</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter tags separated by commas"
          value={state.tags}
          onChange={handleTagsChange}
        />
      </Form.Group>

      <Button variant="primary" type="submit" style={{ backgroundColor: 'red', color: 'white' }}>
        Post
      </Button>
    </Form>
  );
};

export default PostForm;
