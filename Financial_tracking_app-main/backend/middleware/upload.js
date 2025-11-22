/**
 * File Upload Middleware
 * Manages profile picture uploads using Multer with validation and custom storage
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the profile uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename: userId-timestamp-random.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

// File filter: allow images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Initialize Multer with limits and validation
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maximum file size: 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
