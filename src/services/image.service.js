const sharp = require('sharp');
const cloudinary = require('../config/cloudinary');
const env = require('../config/env');

async function optimizeImage(buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}

async function uploadImage(buffer, filename) {
  const optimizedBuffer = await optimizeImage(buffer);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.cloudinary.folder,
        resource_type: 'image',
        public_id: filename ? filename.replace(/\.[^/.]+$/, '') : undefined
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    stream.end(optimizedBuffer);
  });
}

module.exports = {
  uploadImage
};
