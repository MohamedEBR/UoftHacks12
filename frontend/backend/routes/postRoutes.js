import express from 'express';
const router = express.Router();
import { check, validationResult } from 'express-validator';
import auth from '../middleware/auth.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import multer from 'multer';
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, './files');
    },
    filename(req, file, cb) {
      cb(null, `${new Date().getTime()}_${file.originalname}`);
    }
  }),
  limits: {
    fileSize: 1000000 // max file size 1MB = 1000000 bytes
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|JPG|png|pdf|doc|docx|xlsx|xls|mp4|avi|mkv|mov)$/)) {
      return cb(
        new Error(
          'only upload files with jpg, jpeg, png, pdf, doc, docx, xslx, xls format.'
        )
      );
    }
    cb(undefined, true); // continue with upload
  }
});


// @route   POST api/posts
// @desc    Create a post
// @access  Private
/* POST post */
router.post(
  '/',
  upload.single('file'),
  async (req, res) => {
    try {
      const { title, date, content } = req.body;
      const { path, mimetype } = req.file;
      const blog = new Blog({
        title,
        date,
        content,
        file_path: path,
        file_mimetype: mimetype
      });
      await blog.save();
      res.send('file uploaded successfully.');
    } catch (error) {
      
      res.status(400).send(`Error while uploading file. Try again later. ${error}`);
    }
  },
  (error, req, res, next) => {
    if (error) {
      res.status(500).send(error.message);
    }
  }
);

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/posts/:id
// @desc    Get post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await post.remove();

    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', [auth, [
  check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    post.text = req.body.text;
    post.imageUrl = req.body.imageUrl;
    post.tags = req.body.tags;
    post.updatedAt = Date.now();

    await post.save();

    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has not yet been liked
    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    // remove the like
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/posts/comment/:id
// @desc     Add a comment to a post
// @access   Private
router.post('/comment/:id', [auth, [
  check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.id);

    const newComment = {
      text: req.body.text,
      name: user.username,
      avatar: user.avatar,
      user: req.user.id
    };

    post.comments.unshift(newComment);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
