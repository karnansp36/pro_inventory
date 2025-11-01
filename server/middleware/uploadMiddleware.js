import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Temporary upload directory
const tempDir = './uploads/temp/';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter(req, file, cb) {
    const allowed = /jpeg|jpg|png|webp/;
    const isValid =
      allowed.test(file.mimetype) &&
      allowed.test(path.extname(file.originalname).toLowerCase());
    cb(isValid ? null : new Error('Only image files are allowed!'), isValid);
  },
}).single('image'); // field name = image

// uploadMiddleware.js - Updated compressImage function
const compressImage = async (req, res, next) => {
  console.log('req.file in compressImage:', req.file);
  console.log('req.body in compressImage:', req.body);
  if (!req.file) return next();

  const outputDir = './uploads/dailyStoreImages/';
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `compressed-${req.file.filename}`);

  try {
    await sharp(req.file.path)
      .resize({ width: 1280, height: 720, fit: 'inside' })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    // Remove temp file asynchronously with error handling
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.warn('Warning: Could not delete temp file:', err.message);
        // Continue anyway - this is not a critical error
      }
      
      // Replace file info with compressed version
      req.file.path = outputPath;
      req.file.filename = `compressed-${req.file.filename}`;
      next();
    });
  } catch (err) {
    console.error('Image compression error:', err);
    
    // Try to clean up the output file if it was created
    if (fs.existsSync(outputPath)) {
      fs.unlink(outputPath, (unlinkErr) => {
        if (unlinkErr) console.warn('Could not clean up output file:', unlinkErr.message);
      });
    }
    
    res.status(500).json({ message: 'Failed to process image' });
  }
};

export { upload, compressImage };
