const crypto = require('crypto');
const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');
const env = require('./env');

// Create BlobServiceClient
const blobServiceClient = new BlobServiceClient(
  `https://${env.azureStorage.accountName}.blob.core.windows.net`,
  new StorageSharedKeyCredential(env.azureStorage.accountName, env.azureStorage.accountKey)
);

// Get container client
const containerClient = blobServiceClient.getContainerClient(env.azureStorage.containerName);

async function uploadImage(buffer, filename) {
  const blobName = `${Date.now()}-${filename}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    const uploadResponse = await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: 'image/jpeg' },
      metadata: {
        originalName: filename,
        uploadTime: new Date().toISOString()
      }
    });

    return {
      url: blockBlobClient.url,
      blobName: blobName,
      etag: uploadResponse.etag,
      lastModified: uploadResponse.lastModified,
      contentLength: uploadResponse.contentLength
    };
  } catch (error) {
    console.error('Azure Blob upload error:', error);
    throw new Error(`Failed to upload image to Azure Blob: ${error.message}`);
  }
}

async function deleteImage(blobName) {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
    return true;
  } catch (error) {
    console.error('Azure Blob delete error:', error);
    throw new Error(`Failed to delete image from Azure Blob: ${error.message}`);
  }
}

async function getImageProperties(blobName) {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const properties = await blockBlobClient.getProperties();
    return properties;
  } catch (error) {
    console.error('Azure Blob get properties error:', error);
    throw new Error(`Failed to get image properties from Azure Blob: ${error.message}`);
  }
}

module.exports = {
  blobServiceClient,
  containerClient,
  uploadImage,
  deleteImage,
  getImageProperties
};
