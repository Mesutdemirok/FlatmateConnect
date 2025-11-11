import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

// ⚙️ Cloudflare R2 Setup (trim credentials to handle whitespace)
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_S3_ENDPOINT?.trim(),
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID?.trim()!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY?.trim()!,
  },
});

const R2_BUCKET = process.env.R2_BUCKET_NAME?.trim()!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL?.trim()!;

/**
 * Upload a file to Cloudflare R2
 * @param localPath - Local file path (e.g., "uploads/listings/image.jpg")
 * @param r2Key - Key in R2 bucket (e.g., "uploads/listings/image.jpg")
 * @returns Public URL of the uploaded file
 */
export async function uploadToR2(localPath: string, r2Key?: string): Promise<string> {
  // If no r2Key provided, use the local path structure
  const key = r2Key || localPath.replace(/^\/+/, "");
  
  // Read file from local disk
  const fileContent = fs.readFileSync(localPath);
  
  // Determine content type
  const ext = path.extname(localPath).toLowerCase();
  const contentType = 
    ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
    ext === '.png' ? 'image/png' :
    ext === '.webp' ? 'image/webp' :
    ext === '.avif' ? 'image/avif' :
    'application/octet-stream';
  
  // Upload to R2
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
  });
  
  await r2.send(command);
  
  // Return public URL
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Delete a file from Cloudflare R2
 * @param r2Key - Key in R2 bucket
 */
export async function deleteFromR2(r2Key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: r2Key.replace(/^\/+/, ""),
  });
  
  await r2.send(command);
}

/**
 * Get the public URL for an R2 object
 * @param r2Key - Key in R2 bucket
 */
export function getR2Url(r2Key: string): string {
  return `${R2_PUBLIC_URL}/${r2Key.replace(/^\/+/, "")}`;
}

/**
 * Upload a Buffer directly to Cloudflare R2
 * @param r2Key - Key in R2 bucket (e.g., "seekers/photo-123.jpg")
 * @param buffer - File buffer
 * @param options - Optional metadata (contentType, cacheControl)
 * @returns Key in R2 bucket
 */
export async function uploadBufferToR2(
  r2Key: string,
  buffer: Buffer,
  options?: { contentType?: string; cacheControl?: string }
): Promise<string> {
  const key = r2Key.replace(/^\/+/, "");
  
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: options?.contentType || 'application/octet-stream',
    CacheControl: options?.cacheControl || 'public, max-age=31536000, immutable',
  });
  
  await r2.send(command);
  
  return key;
}
