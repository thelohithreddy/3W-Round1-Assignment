import { v2 as cloudinary } from 'cloudinary';

const isRealValue = (value) => {
  const v = value?.trim();
  if (!v) return false;
  if (v.startsWith('your_')) return false;
  if (v.includes('your_')) return false;
  return true;
};

export const isCloudinaryConfigured = () =>
  isRealValue(process.env.CLOUDINARY_CLOUD_NAME) &&
  isRealValue(process.env.CLOUDINARY_API_KEY) &&
  isRealValue(process.env.CLOUDINARY_API_SECRET);

export const configureCloudinary = () => {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Add keys to backend/.env or use local upload (dev only).'
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
  });
  return cloudinary;
};

export default cloudinary;
