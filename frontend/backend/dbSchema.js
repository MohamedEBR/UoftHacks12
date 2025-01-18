//USELESS DONT TOUCH

import mongoose from "mongoose";
const fileSchema = new mongoose.Schema({
  fileData: {
    type: Buffer,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

const File = mongoose.model('File', fileSchema);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
});

const User = mongoose.model('User', userSchema);

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 280,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model('Post', postSchema);

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: false,
  },
  tags: {
    type: [String],
    required: false,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = { File, User, Blog };
