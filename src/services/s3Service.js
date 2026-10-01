import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/**
 * Uploads media file buffer to AWS S3 bucket.
 * @param {Object} media - File object containing originalname, buffer, mimetype, size.
 * @param {string} folder - Target folder prefix in bucket.
 * @returns {Promise<Object|null>} Attachment object containing key, type, mimeType, originalName, size, or null if failed.
 */
export const uploadMediaToS3 = async (media, folder = "complaints") => {
  if (!media) return null;

  try {
    const key = `${folder}/${Date.now()}-${media.originalname}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: media.buffer,
        ContentType: media.mimetype
      })
    );

    const type = media.mimetype.startsWith("video/") ? "video" : "image";

    return {
      key,
      type,
      mimeType: media.mimetype,
      originalName: media.originalname,
      size: media.size
    };
  } catch (err) {
    console.error("Image upload failed:", err.message);
    return null;
  }
};

/**
 * Generates a signed URL for reading an object from AWS S3.
 * @param {string} key - S3 object key.
 * @param {number} expiresIn - Expiration time in seconds (default 3600).
 * @returns {Promise<string|null>} Signed URL string or null if failed.
 */
export const getPresignedUrlForAttachment = async (key, expiresIn = 3600) => {
  if (!key) return null;

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    return await getSignedUrl(s3, command, { expiresIn });
  } catch (error) {
    console.error("Failed to generate signed URL:", error);
    return null;
  }
};
