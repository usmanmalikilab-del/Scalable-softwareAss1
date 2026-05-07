const { randomUUID } = require('crypto');
const { BlobServiceClient } = require('@azure/storage-blob');
const env = require('./env');

// Create BlobServiceClient using connection string directly
const blobServiceClient = BlobServiceClient.fromConnectionString(env.azureStorage.connectionString);

// Get container client
const containerClient = blobServiceClient.getContainerClient(env.azureStorage.containerName);

async function initContainer() {
  try {
    await containerClient.createIfNotExists({ access: 'private' });
    console.log('✅ Azure container initialized successfully');
  } catch (error) {
    if (error.code === 'PublicAccessNotPermitted') {
      console.log('⚠️ Container already exists with private access');
    } else {
      console.error('❌ Failed to initialize Azure container:', error.message);
      throw error;
    }
  }
}

const init = async () => {
  // Only initialize in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    await initContainer();
  }
};

init().catch(console.error);
async function uploadImage(buffer, filename, mimeType = 'image/jpeg') {
const blobName = `${Date.now()}-${randomUUID()}-${filename}`;  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
      metadata: {
        originalName: filename,
        uploadTime: new Date().toISOString()
      }
    });

    return {
      url: blockBlobClient.url,
      blobName
    };
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
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
