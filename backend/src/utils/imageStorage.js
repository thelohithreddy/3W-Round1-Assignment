import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { configureCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

export { isCloudinaryConfigured };

const ensureUploadDir = async () => {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
};

const uploadToCloudinary = (buffer) => {
  const cloudinary = configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'social-posts', resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

const uploadToLocalDisk = async (file) => {
  await ensureUploadDir();
  const rawExt = file.originalname?.split('.').pop()?.toLowerCase() || 'jpg';
  const ext = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(rawExt) ? rawExt : 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), file.buffer);

  const port = process.env.PORT || 5000;
  const base = (process.env.API_PUBLIC_URL || `http://localhost:${port}`).replace(/\/$/, '');

  return {
    url: `${base}/uploads/${filename}`,
    publicId: `local:${filename}`,
  };
};

/** Upload post image — Cloudinary if configured, else local folder (dev only). */
export const uploadPostImage = async (file) => {
  if (!file?.buffer) {
    throw new Error('No image file provided');
  }

  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(file.buffer);
  }

  return uploadToLocalDisk(file);
};

/** Remove image from Cloudinary or local disk. */
export const deletePostImage = async (publicId) => {
  if (!publicId) return;

  if (publicId.startsWith('local:')) {
    const filename = publicId.slice('local:'.length);
    try {
      await fs.unlink(path.join(UPLOAD_DIR, filename));
    } catch {
      /* file may already be gone */
    }
    return;
  }

  if (isCloudinaryConfigured()) {
    const cloudinary = configureCloudinary();
    await cloudinary.uploader.destroy(publicId);
  }
};
