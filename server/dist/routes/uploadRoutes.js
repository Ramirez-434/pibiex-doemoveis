"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const router = (0, express_1.Router)();
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// Configure storage specific to multer-storage-cloudinary
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: 'doebrasil_uploads',
    },
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 7 * 1024 * 1024 }, // 7MB limit
});
const authMiddleware_1 = require("../middleware/authMiddleware");
router.post('/', authMiddleware_1.authenticateToken, (req, res, next) => {
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
exports.default = router;
