import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 7 * 1024 * 1024 }, // 7MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Apenas imagens são permitidas!'));
    }
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

    // Return the public URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    console.log('DEBUG: File URL:', fileUrl);
    res.json({ url: fileUrl });
});

export default router;
