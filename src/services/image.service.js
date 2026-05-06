const sharp = require('sharp');
const { uploadImage: uploadToAzure, deleteImage: deleteFromAzure } = require('../config/azure-storage');

async function optimizeImage(buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}

async function uploadImage(buffer, filename) {
  const optimizedBuffer = await optimizeImage(buffer);

  // Generate a unique filename if not provided
  const uniqueFilename = filename || `image-${Date.now()}.jpg`;

  try {
    const result = await uploadToAzure(optimizedBuffer, uniqueFilename);

    // Return the same structure as Cloudinary for compatibility
    return {
      url: result.url,
      public_id: result.blobName, // Keep same field name for compatibility
      etag: result.etag,
      lastModified: result.lastModified,
      contentLength: result.contentLength,
      resource_type: 'image',
      format: 'jpeg'
    };
  } catch (error) {
    console.error('Azure Blob upload error:', error);
    throw error;
  }
}

async function deleteImage(blobName) {
  try {
    await deleteFromAzure(blobName);
    return { success: true, deleted: blobName };
  } catch (error) {
    console.error('Azure Blob delete error:', error);
    throw error;
  }
}

module.exports = {
  uploadImage,
  deleteImage
};
