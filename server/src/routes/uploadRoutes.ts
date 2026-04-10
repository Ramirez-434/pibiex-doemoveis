import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage specific to multer-storage-cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'doebrasil_uploads', // Folder name in your cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  } as any,
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 7 * 1024 * 1024 }, // 7MB limit
});

import { authenticateToken } from '../middleware/authMiddleware';

router.post('/', authenticateToken, (req, res, next) => {
    console.log('DEBUG: Upload request received');
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('DEBUG: Multer error:', err);
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, (req, res) => {
    console.log('DEBUG: File uploaded:', req.file);
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    // Return the Cloudinary public URL
    const fileUrl = req.file.path; 
    console.log('DEBUG: File URL:', fileUrl);
    res.json({ url: fileUrl });
});

export default router;
