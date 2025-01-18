import mongoose from 'mongoose';

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

export default File;
