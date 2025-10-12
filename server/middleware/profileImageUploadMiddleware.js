import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Destination for profile images
const profileImageDir = './uploads/profileImages/';
if (!fs.existsSync(profileImageDir)) {
  fs.mkdirSync(profileImageDir, { recursive: true });
}

const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profileImageDir),
  filename: (req, file, cb) => {
    const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const profileImageUpload = multer({
  storage: profileImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter(req, file, cb) {
    const allowed = /jpeg|jpg|png|webp/;
    const isValid =
      allowed.test(file.mimetype) &&
      allowed.test(path.extname(file.originalname).toLowerCase());
    cb(isValid ? null : new Error('Only image files are allowed!'), isValid);
  },
});

export { profileImageUpload };