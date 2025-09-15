import multer from 'multer';
import path from 'path';

// Define dónde se guardarán las imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define la ruta a la carpeta de subida
    const uploadPath = path.resolve(__dirname, '../../../frontend/public/uploads');
        
    // Los archivos se guardarán en 'frontend/public/uploads/'
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Genera un nombre de archivo temporal único y conserva la extensión original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `temp-${uniqueSuffix}${extension}`);
  }
});

// Filtro para aceptar solo ciertos tipos de imágenes
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
    cb(null, true);
  } else {
    cb(new Error('Formato de imagen no válido. Solo se acepta JPG, PNG o WebP.'));
  }
};

export const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 1024 * 1024 * 5 } }); // Límite de 5MB