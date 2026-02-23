const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // e.g., image-1634567890.jpg
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// File type validation
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedVideoTypes = /mp4|mov|avi|mkv/;

    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    if (file.fieldname === 'image') {
        if (allowedImageTypes.test(extname) && allowedImageTypes.test(mimetype)) {
            return cb(null, true);
        }
        return cb(new Error('Only image files are allowed!'), false);
    }

    if (file.fieldname === 'video') {
        if (allowedVideoTypes.test(extname) && allowedVideoTypes.test(mimetype)) {
            return cb(null, true);
        }
        return cb(new Error('Only video files are allowed!'), false);
    }

    cb(new Error('Unexpected field'), false);
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB max for videos
    },
    fileFilter: fileFilter
});

module.exports = upload;
