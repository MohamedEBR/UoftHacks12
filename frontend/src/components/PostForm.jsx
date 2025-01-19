import React, { useState, useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import { AuthContext } from '../context/AuthContext';

const PostForm = () => {
  const [state, setState] = useState({
    title: '',
    content: '',
    tags: '',
  });
  const [file_path, setFile_path] = useState(null);
  const [previewSrc, setPreviewSrc] = useState('');
  const [isPreviewAvailable, setIsPreviewAvailable] = useState(false);
  const dropRef = React.createRef();
  const { token } = useContext(AuthContext);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleTagsChange = (e) => {
    const { value } = e.target;
    setState((prevState) => ({
      ...prevState,
      tags: value,
    }));
  };

  const onDrop = (files) => {
    const [uploadedFile] = files;
    setFile_path(uploadedFile);

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewSrc(fileReader.result);
      setIsPreviewAvailable(uploadedFile.type.startsWith('image') || uploadedFile.type.startsWith('video'));
    };
    fileReader.readAsDataURL(uploadedFile);
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

      if (title && content && tags && title.trim() !== '' && content.trim() !== '' && tags.trim() !== '') {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('tags', tags);

        if (file_path) {
          formData.append('file_path', file_path); // Ensure the field name is 'file'
        }

        const response = await fetch('http://localhost:5001/api/posts', {
          method: 'POST',
          headers: {
'x-auth-token': `${token}`,          },
          body: formData,
        });

        console.log('Response:', response);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Post created successfully:', data);
      } else {
        console.error('All fields are required.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
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
          name="content"
          placeholder="What's on your mind?"
          value={state.content || ''}
          onChange={handleInputChange}
        />
      </Form.Group>

      <div className="upload-section">
        <Dropzone
          onDrop={onDrop}
          onDragEnter={() => updateBorder('over')}
          onDragLeave={() => updateBorder('leave')}
        >
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps({ className: 'drop-zone' })} ref={dropRef}>
              <input {...getInputProps()} />
              <p>Drag and drop a file OR click here to select a file</p>
              {file_path && (
                <div>
                  <strong>Selected file:</strong> {file_path.name}
                </div>
              )}
            </div>
          )}
        </Dropzone>
        {previewSrc ? (
          isPreviewAvailable ? (
            <div className="media-preview">
              {file_path.type.startsWith('image') && (
                <img className="preview-image" src={previewSrc} alt="Preview" />
              )}
              {file_path.type.startsWith('video') && (
                <video className="preview-video" src={previewSrc} controls />
              )}
            </div>
          ) : (
            <div className="preview-message">
              <p>No preview available for this file</p>
            </div>
          )
        ) : (
          <div className="preview-message">
            <p>Image/Video preview will be shown here after selection</p>
          </div>
        )}
      </div>

      <Form.Group className="mb-3" controlId="tags">
        <Form.Label>Tags</Form.Label>
        <Form.Control
          type="text"
          name="tags"
          placeholder="Enter tags separated by commas"
          value={state.tags || ''}
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