import AWS from 'aws-sdk';
import path from 'path';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'eu-west-1'
});

// Upload file to S3
export const uploadToS3 = async (file, folder = 'uploads') => {
  try {
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    const key = `${folder}/${filename}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    return result.Location; // Returns the public URL
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Errore durante il caricamento su S3');
  }
};

// Delete file from S3
export const deleteFromS3 = async (fileUrl) => {
  try {
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error('Errore durante l\'eliminazione da S3');
  }
};

// Bulk delete files from S3
export const deleteMultipleFromS3 = async (fileUrls) => {
  try {
    const objects = fileUrls.map(url => {
      const urlObj = new URL(url);
      const key = urlObj.pathname.substring(1);
      return { Key: key };
    });

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Delete: { Objects: objects }
    };

    await s3.deleteObjects(params).promise();
    return true;
  } catch (error) {
    console.error('S3 Bulk Delete Error:', error);
    throw new Error('Errore durante l\'eliminazione da S3');
  }
};

// Generate presigned URL for temporary access
export const generatePresignedUrl = async (fileUrl, expirationSeconds = 3600) => {
  try {
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: expirationSeconds
    };

    const presignedUrl = await s3.getSignedUrlPromise('getObject', params);
    return presignedUrl;
  } catch (error) {
    console.error('Presigned URL Error:', error);
    throw new Error('Errore durante la generazione dell\'URL firmato');
  }
};
