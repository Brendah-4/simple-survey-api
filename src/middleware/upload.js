const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary config:', process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY ? 'key set' : 'key missing');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'sky-survey/certificates',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

module.exports = upload;