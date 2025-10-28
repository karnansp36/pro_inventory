import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create directories if they don't exist
const profileDir = './uploads/profileImages/';
const bannerDir = './uploads/bannerImages/';

[profileDir, bannerDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Combined storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profileImage') {
      cb(null, profileDir);
    } else if (file.fieldname === 'bannerImage') {
      cb(null, bannerDir);
    } else {
      cb(new Error('Unexpected field'), false);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Combined upload middleware
const combinedUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const isValid = allowed.test(file.mimetype) && 
                   allowed.test(path.extname(file.originalname).toLowerCase());
    
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
}).fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 }
]);

export { combinedUpload };