import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../public/assets/product-images');

// Ensure local uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer memory storage so we can stream to Cloudinary or write locally
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP) are allowed.'), false);
    }
  }
});

// Helper to check if Cloudinary is configured
function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

// @desc    Upload product image (Cloudinary with local asset fallback)
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, adminOnly, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file && !req.body.imageBase64) {
      return res.status(400).json({ success: false, message: 'No image file or data provided.' });
    }

    const fileBuffer = req.file ? req.file.buffer : Buffer.from(req.body.imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const originalName = req.file ? req.file.originalname : 'upload.jpg';
    const ext = path.extname(originalName) || '.jpg';
    const cleanFileName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;

    // 1. Try Cloudinary if configured
    if (isCloudinaryConfigured()) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      try {
        const uploadPromise = new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'loop_n_love_products',
              resource_type: 'image'
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(fileBuffer);
        });

        const cloudRes = await uploadPromise;
        return res.json({
          success: true,
          url: cloudRes.secure_url,
          storage: 'cloudinary',
          public_id: cloudRes.public_id
        });
      } catch (cloudErr) {
        console.warn('Cloudinary upload error, falling back to local storage:', cloudErr.message);
      }
    }

    // 2. Local Fallback: save to frontend/assets/product-images/
    const localFilePath = path.join(uploadsDir, cleanFileName);
    fs.writeFileSync(localFilePath, fileBuffer);

    return res.json({
      success: true,
      url: `assets/product-images/${cleanFileName}`,
      storage: 'local'
    });

  } catch (err) {
    next(err);
  }
});

export default router;
