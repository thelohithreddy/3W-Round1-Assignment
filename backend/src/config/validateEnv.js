const REQUIRED = ['MONGO_URI', 'JWT_SECRET'];

const CLOUDINARY_KEYS = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

export const validateEnv = () => {
  const missing = REQUIRED.filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    console.error(`\n❌ Missing required environment variables:\n   ${missing.join('\n   ')}\n`);
    console.error('Copy backend/.env.example to backend/.env and fill in values.\n');
    process.exit(1);
  }

  const missingCloudinary = CLOUDINARY_KEYS.filter((key) => !process.env[key]?.trim());

  if (missingCloudinary.length) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        `\n❌ Production requires Cloudinary for images:\n   ${missingCloudinary.join('\n   ')}\n`
      );
      console.error('Free signup: https://cloudinary.com\n');
      process.exit(1);
    }

    console.warn(
      '\n📁 Cloudinary not set — images will save to backend/uploads/ (local dev only).'
    );
    console.warn('   For deployment on Render, add free Cloudinary keys later.');
    console.warn('   See CLOUDINARY_SETUP.md\n');
  }

  if (!process.env.CLIENT_URL?.trim()) {
    console.warn('⚠️  CLIENT_URL not set — using localhost defaults for CORS\n');
  }
};

export default validateEnv;
