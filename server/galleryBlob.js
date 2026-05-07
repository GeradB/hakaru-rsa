import { BlobServiceClient } from '@azure/storage-blob';

export const isAzureGalleryConfigured = () =>
  !!process.env.AZURE_STORAGE_CONNECTION_STRING;

const getContainerClient = () => {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
  }
  const service = BlobServiceClient.fromConnectionString(connectionString);
  const containerName = process.env.AZURE_STORAGE_GALLERY_CONTAINER || 'gallery';
  return service.getContainerClient(containerName);
};

/**
 * Ensures container exists. Uses public blob access so img tags work without SAS.
 */
export const ensureGalleryContainer = async () => {
  const container = getContainerClient();
  await container.createIfNotExists({ access: 'blob' });
  return container;
};

export const uploadGalleryImage = async (buffer, blobName, contentType) => {
  const container = await ensureGalleryContainer();
  const block = container.getBlockBlobClient(blobName);
  await block.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType || 'application/octet-stream' },
  });
  return block.url;
};

export const deleteGalleryBlob = async (blobName) => {
  const container = getContainerClient();
  const block = container.getBlockBlobClient(blobName);
  await block.deleteIfExists();
};
