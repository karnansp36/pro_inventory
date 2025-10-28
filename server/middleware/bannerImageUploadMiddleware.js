import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Banner image upload directory
const bannerDir = './uploads/bannerImages/';
if (!fs.existsSync(bannerDir)) {
  fs.mkdirSync(bannerDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, bannerDir),
  filename: (req, file, cb) => {
    const uniqueName = `banner-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const bannerImageUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB for banners
  fileFilter(req, file, cb) {
    const allowed = /jpeg|jpg|png|webp/;
    const isValid =
      allowed.test(file.mimetype) &&
      allowed.test(path.extname(file.originalname).toLowerCase());
    cb(isValid ? null : new Error('Only image files are allowed!'), isValid);
  },
});

// Middleware to compress banner image
const compressBannerImage = async (req, res, next) => {
  if (!req.file) return next();

  const outputPath = path.join(bannerDir, `compressed-${req.file.filename}`);

  try {
    await sharp(req.file.path)
      .resize({ width: 1920, height: 1080, fit: 'inside' }) // Compress to 1080p
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    // Remove original file
    fs.unlinkSync(req.file.path);

    // Replace file info with compressed version
    req.file.path = outputPath;
    req.file.filename = `compressed-${req.file.filename}`;
    next();
  } catch (err) {
    console.error('Banner image compression error:', err);
    res.status(500).json({ message: 'Failed to process banner image' });
  }
};

export { bannerImageUpload, compressBannerImage };