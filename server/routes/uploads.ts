import { Router, Request, Response } from "express";
import Busboy from "busboy";
import sharp from "sharp";
import { uploadBufferToR2, getR2Url } from "../r2-utils";

const router = Router();

/**
 * Upload endpoint for seeker profile photos
 * - Accepts HEIC/HEIF/JPEG/PNG/WebP
 * - Converts all to JPEG with compression
 * - Auto-rotates based on EXIF
 * - Resizes to max 1600px width
 * - Uploads to R2 storage
 */
router.post("/api/uploads/seeker-photo", (req: Request, res: Response) => {
  console.log('📸 Seeker photo upload started');
  console.log('Headers:', req.headers);
  
  const bb = Busboy({ headers: req.headers });
  let hasFile = false;
  let responseSent = false;

  bb.on("file", (fieldname: string, file: NodeJS.ReadableStream, info: Busboy.FileInfo) => {
    hasFile = true;
    const { mimeType, filename } = info;
    
    console.log('📁 File received:', { fieldname, filename, mimeType });

    // Accept common image formats including HEIC
    const allowed = [
      "image/jpeg",
      "image/jpg", 
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
      "" // Some browsers don't set MIME type for HEIC
    ];
    
    // Also check file extension
    const fileExtension = filename.split('.').pop()?.toLowerCase() || '';
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
    
    const isValidType = allowed.includes(mimeType.toLowerCase()) || allowedExtensions.includes(fileExtension);

    if (!isValidType) {
      console.log('❌ Invalid file type:', mimeType, fileExtension);
      file.resume(); // Drain the stream
      if (!responseSent) {
        responseSent = true;
        return res.status(400).json({ 
          message: `Desteklenmeyen dosya formatı (${mimeType || fileExtension}). JPEG, PNG, WebP veya HEIC kullanın.` 
        });
      }
      return;
    }

    const chunks: Buffer[] = [];
    let totalSize = 0;
    
    file.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
      totalSize += chunk.length;
      
      // Limit file size to 15MB during upload
      if (totalSize > 15 * 1024 * 1024) {
        console.log('❌ File too large:', totalSize);
        file.resume();
        if (!responseSent) {
          responseSent = true;
          return res.status(400).json({ 
            message: "Dosya çok büyük. Maksimum 10MB yükleyebilirsiniz." 
          });
        }
      }
    });

    file.on("end", async () => {
      if (responseSent) return;
      
      try {
        const inputBuffer = Buffer.concat(chunks);
        console.log('✓ File buffered:', inputBuffer.length, 'bytes');
        
        // Process image with Sharp:
        // 1. Auto-rotate based on EXIF orientation
        // 2. Resize to max 1600px width (maintain aspect ratio)
        // 3. Convert to JPEG with 82% quality
        console.log('🔄 Processing image...');
        const processedBuffer = await sharp(inputBuffer)
          .rotate() // Auto-rotate based on EXIF
          .resize({
            width: 1600,
            withoutEnlargement: true, // Don't upscale smaller images
            fit: 'inside'
          })
          .jpeg({
            quality: 82,
            progressive: true
          })
          .toBuffer();

        console.log('✓ Image processed:', processedBuffer.length, 'bytes');

        // Generate unique filename
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const r2Key = `seekers/${timestamp}-${randomSuffix}.jpg`;

        console.log('☁️ Uploading to R2:', r2Key);
        // Upload to R2
        await uploadBufferToR2(r2Key, processedBuffer, {
          contentType: "image/jpeg",
          cacheControl: "public, max-age=31536000, immutable"
        });

        // Return both the key and full CDN URL
        const cdnUrl = getR2Url(r2Key);
        console.log('✅ Upload complete:', cdnUrl);

        if (!responseSent) {
          responseSent = true;
          return res.json({
            success: true,
            imagePath: r2Key, // Store this in DB
            url: cdnUrl // Use this for immediate preview
          });
        }

      } catch (error) {
        console.error("❌ Image processing error:", error);
        if (!responseSent) {
          responseSent = true;
          return res.status(500).json({ 
            message: "Fotoğraf işlenirken hata oluştu. Lütfen tekrar deneyin.",
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    });

    file.on("error", (error: Error) => {
      console.error("❌ File stream error:", error);
      if (!responseSent) {
        responseSent = true;
        res.status(500).json({ 
          message: "Dosya yüklenirken hata oluştu.",
          error: error.message
        });
      }
    });
  });

  bb.on("finish", () => {
    if (!hasFile && !responseSent) {
      console.log('❌ No file received');
      responseSent = true;
      res.status(400).json({ 
        message: "Fotoğraf seçilmedi." 
      });
    }
  });

  bb.on("error", (error: Error) => {
    console.error("❌ Busboy error:", error);
    if (!responseSent) {
      responseSent = true;
      res.status(500).json({ 
        message: "Dosya yüklemesi başarısız oldu.",
        error: error.message
      });
    }
  });

  req.pipe(bb);
});

export default router;
