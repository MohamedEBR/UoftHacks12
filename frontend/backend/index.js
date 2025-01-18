const express = require("express");
const multer = require('multer');
const mongoose = require('mongoose');
const File = require('./dbSchema.js');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const uri = process.env.URI;

async function connectDB() {
  try {
    await mongoose.connect(uri);
    console.log("Successfully connected to MongoDB with Mongoose!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectDB();




const app = express();


app.use(cors({
  origin: "*", // #TODO: https://domain/
  methods: "GET,PUT,POST,DELETE", 
  credentials: true,
}));

// Middleware to parse JSON requests
app.use(express.json());

// Define a simple route
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100000000 // 1MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|JPG|png|pdf|doc|docx|xlsx|xls|mp4|avi|mov|mkv)$/)) {
      return cb(
        new Error(
          'only upload files with jpg, jpeg, png, pdf, doc, docx, xlsx, xls format.'
        )
      );
    }
    cb(undefined, true); // continue with upload
  }
});

// Handle file uploads
app.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).send(err.message);
    } else if (err) {
      return res.status(400).send(err.message);
    }
    next();
  });
}, async (req, res) => {
  try {
    const { originalname, mimetype, buffer } = req.file;
    const newFile = new File({
      fileName: originalname,
      mimeType: mimetype,
      fileData: buffer,
    });
    await newFile.save();
    res.status(201).send('File uploaded successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file');
  }
});
// Start the server
const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
