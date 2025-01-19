import express from "express";
import path from "path";
import { spawn } from "child_process";
import auth from "../middleware/auth.js";
import multer from "multer";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { check, validationResult } from "express-validator";

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "./files");
    },
    filename(req, file, cb) {
      cb(null, `${new Date().getTime()}_${file.originalname}`);
    },
  }),
  // limits: {
  //   fileSize: 100000000000 // max file size 1MB = 1000000 bytes
  // },
  fileFilter(req, file, cb) {
    if (
      !file.originalname.match(
        /\.(jpeg|jpg|JPG|png|pdf|doc|docx|xlsx|xls|mp4|avi|mkv|mov)$/
      )
    ) {
      return cb(
        new Error(
          "only upload files with jpg, jpeg, png, pdf, doc, docx, xslx, xls format."
        )
      );
    }
    cb(undefined, true);
  },
});

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post("/", auth, upload.single("file_path"), async (req, res) => {
  
    const { title, content, tags } = req.body;
  const file_path = req.file;
  const pet = req.body.pet;

  const dogscriptPath = path.join("../../backend", "../scripts/dogcolorblind.py");
  const catscriptPath = path.join("../../backend", "../scripts/catcolorblind.py");

  const scriptPaths = {
    cat: catscriptPath,
    dog: dogscriptPath,
    // Add more pet types and their corresponding scripts here
  };

  function generateUniqueFileName(baseName = "output", extension = ".txt") {
    const timestamp = Date.now(); // Current timestamp
    return `${baseName}_${timestamp}${extension}`;
  }
  const uniqueFileName = generateUniqueFileName("pet_output", ".mp4");
  console.log(req.file.path.split("/").splice(0, -1).join("/") + `${uniqueFileName}`);
  const updateFilePath =
    req.file.path.split("/").splice(0, -1).join("/") +`${uniqueFileName}`;
    
    
    const pythonProcess = spawn("python", [
      scriptPaths[pet],
      file_path.path,
      updateFilePath,
    ]);
  


  pythonProcess.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on("close", async (code) => {
    console.log(`child process exited with code ${code}`);
    if (code !== 0) {
      return res.status(500).send("Script execution failed");
    }

    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        title,
        content,
        tags,
        pet,
        file_path: updateFilePath,
        user: req.user.id,
        name: user.username,
        avatar: user.avatar,
        file_mimetype: file_path ? file_path.mimetype : null,
      });

      const post = await newPost.save();
      console.log("Post created:", post);
      res.json(post);
    } catch (err) {
      console.error("Error creating post:", err.message);
      res.status(500).send("Server Error");
    }
  });
});

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/posts/:id
// @desc    Get post by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await post.remove();

    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/posts/:id
// @desc    Update a post
// @access  Private
router.put(
  "/:id",
  [
    auth,
    [
      check("text", "Text is required").not().isEmpty(),
      check("imageUrl", "Image URL is required").not().isEmpty(),
      check("tags", "Tags are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ msg: "Post not found" });
      }

      // Check user
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: "User not authorized" });
      }

      const { text, imageUrl, tags } = req.body;

      post.text = text;
      post.imageUrl = imageUrl;
      post.tags = tags;
      post.updatedAt = Date.now();

      await post.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Post not found" });
      }
      res.status(500).send("Server Error");
    }
  }
);

// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has not yet been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }

    // remove the like
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/posts/comment/:id
// @desc     Add a comment to a post
// @access   Private
router.post(
  "/comment/:id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.username,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
      res.status(500).send("Server Error");
    }
  }
);

export default router;
