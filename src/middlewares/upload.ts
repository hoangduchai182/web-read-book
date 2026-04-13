import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Storage cho file sách (PDF, EPUB)
const bookStorage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        cb(null, path.join(__dirname, '../public/uploads/books'));
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, 'book-' + uniqueSuffix + ext);
    }
});

// Storage cho ảnh bìa
const coverStorage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        cb(null, path.join(__dirname, '../public/uploads/covers'));
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, 'cover-' + uniqueSuffix + ext);
    }
});

// Filter file sách
const bookFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['.pdf', '.epub'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file PDF hoặc EPUB'));
    }
};

// Filter ảnh bìa
const coverFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh JPG, PNG, WEBP'));
    }
};

export const uploadBook = multer({
    storage: bookStorage,
    fileFilter: bookFileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

export const uploadCover = multer({
    storage: coverStorage,
    fileFilter: coverFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});