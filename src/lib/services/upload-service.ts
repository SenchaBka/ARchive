// File upload handling for cloud storage

import { S3Client, PutObjectCommand, GetBucketLocationCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const DEFAULT_REGION = process.env.AWS_REGION || "us-east-1";
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";

// Credentials configuration
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
};

// Debug: Log environment configuration (without sensitive data)
if (typeof window === "undefined") {
  console.log("[S3 Config] Region:", DEFAULT_REGION);
  console.log("[S3 Config] Bucket:", BUCKET_NAME || "NOT SET");
  console.log("[S3 Config] Access Key ID:", credentials.accessKeyId ? `${credentials.accessKeyId.substring(0, 8)}...` : "NOT SET");
}

/**
 * Get the actual region of the S3 bucket
 * This helps avoid PermanentRedirect errors
 */
async function getBucketRegion(): Promise<string> {
  // First try with the configured/default region
  const tempClient = new S3Client({
    region: DEFAULT_REGION,
    credentials,
  });

  try {
    const command = new GetBucketLocationCommand({ Bucket: BUCKET_NAME });
    const response = await tempClient.send(command);
    // GetBucketLocation returns null for us-east-1, or the region string for others
    return response.LocationConstraint || "us-east-1";
  } catch (error) {
    console.warn("Could not detect bucket region, using default:", DEFAULT_REGION);
    return DEFAULT_REGION;
  }
}

/**
 * Create an S3 client with the correct region
 * Returns both the client and the region string for URL construction
 */
async function createS3Client(): Promise<{ client: S3Client; region: string }> {
  const region = await getBucketRegion();
  console.log(`[S3 Upload] Using region: ${region} (configured: ${DEFAULT_REGION})`);
  
  return {
    client: new S3Client({
      region,
      credentials,
    }),
    region, // Store as string for URL construction
  };
}

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Uploads a file to cloud storage (AWS S3)
 * @param file - The file to upload
 * @param folder - Optional folder path in the bucket (e.g., "audio", "media")
 * @returns Promise with the public URL and storage key
 */
export async function uploadFile(
  file: File | Buffer,
  folder: string = "uploads"
): Promise<UploadResult> {
  if (!BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET_NAME environment variable is not set");
  }

  // Create S3 client with correct region
  const { client: s3Client, region: detectedRegion } = await createS3Client();
  let actualRegion = detectedRegion;

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = file instanceof File 
    ? file.name.split(".").pop() 
    : "mp3";
  const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

  // Convert File to Buffer if needed
  let fileBuffer: Buffer;
  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    fileBuffer = Buffer.from(arrayBuffer);
  } else {
    fileBuffer = file;
  }

  // Determine content type
  const contentType = file instanceof File 
    ? file.type || "application/octet-stream"
    : "audio/mpeg";

  // Upload to S3
  // Note: ACLs are disabled on this bucket, so public access must be configured via bucket policy
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
    // ACL removed - bucket doesn't support ACLs (use bucket policy for public access instead)
  });

  try {
    await s3Client.send(command);
  } catch (error: any) {
    // Handle PermanentRedirect by extracting region from error and retrying
    if (error.name === "PermanentRedirect" || error.Code === "PermanentRedirect") {
      const endpoint = error.Endpoint || error.$metadata?.httpHeaders?.location;
      if (endpoint) {
        // Extract region from endpoint: bucket.s3.region.amazonaws.com
        const regionMatch = endpoint.match(/\.s3\.([^.]+)\.amazonaws\.com/);
        if (regionMatch && regionMatch[1]) {
          const correctRegion = regionMatch[1];
          console.log(`[S3 Upload] Detected correct region from error: ${correctRegion}, retrying...`);
          
          // Create new client with correct region and retry
          const retryClient = new S3Client({
            region: correctRegion,
            credentials,
          });
          
          await retryClient.send(command);
          // Update actualRegion for URL construction
          actualRegion = correctRegion;
          
          // Generate URL (presigned or public)
          const usePresignedUrl = process.env.AWS_USE_PRESIGNED_URLS === "true";
          let url: string;
          if (usePresignedUrl) {
            const getObjectCommand = new GetObjectCommand({
              Bucket: BUCKET_NAME,
              Key: fileName,
            });
            const expiresIn = parseInt(process.env.AWS_PRESIGNED_URL_EXPIRES || "3600");
            url = await getSignedUrl(retryClient, getObjectCommand, { expiresIn });
          } else {
            url = `https://${BUCKET_NAME}.s3.${actualRegion}.amazonaws.com/${fileName}`;
          }
          
          return {
            url,
            key: fileName,
          };
        }
      }
    }
    // Re-throw if we can't handle it
    throw error;
  }

  // Generate URL - use presigned URL if bucket is private, otherwise use public URL
  // Presigned URLs work even if bucket doesn't allow public access
  const usePresignedUrl = process.env.AWS_USE_PRESIGNED_URLS === "true";
  
  let url: string;
  if (usePresignedUrl) {
    // Generate presigned URL (works for private buckets, expires after 1 hour by default)
    const getObjectCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });
    const expiresIn = parseInt(process.env.AWS_PRESIGNED_URL_EXPIRES || "3600"); // Default 1 hour
    url = await getSignedUrl(s3Client, getObjectCommand, { expiresIn });
    console.log(`[S3 Upload] Generated presigned URL (expires in ${expiresIn}s)`);
  } else {
    // Use public URL (requires bucket policy for public access)
    url = `https://${BUCKET_NAME}.s3.${actualRegion}.amazonaws.com/${fileName}`;
  }

  return {
    url,
    key: fileName,
  };
}

/**
 * Uploads an audio file (MP3) to cloud storage
 * @param audioFile - The audio file to upload
 * @returns Promise with the public URL
 */
export async function uploadAudioFile(audioFile: File): Promise<string> {
  const result = await uploadFile(audioFile, "audio");
  return result.url;
}
