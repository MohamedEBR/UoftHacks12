import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  file_path : {
    type: String,
  required: true
},
file_mimetype: {
    type: String,
    required: true
  },
  likes: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  tags: [String],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  comments: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true
    },
    name: {
      type: String
    },
    avatar: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
});

const Post = mongoose.model('Post', PostSchema);

export default Post;
