import { Router, Request, Response } from "express";
import Busboy from "busboy";
import sharp from "sharp";
import { uploadBufferToR2, getR2Url } from "../r2-utils";
import { storage } from "../storage";
import { jwtAuth } from "../auth";

const router = Router();

/**
 * Upload endpoint for seeker profile photos
 * - Requires authentication
 * - Accepts HEIC/HEIF/JPEG/PNG/WebP
 * - Converts all to JPEG with compression
 * - Auto-rotates based on EXIF
 * - Resizes to max 1600px width
 * - Uploads to R2 storage
 */
router.post("/api/uploads/seeker-photo", jwtAuth, (req: Request, res: Response) => {
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

/**
 * Upload endpoint for user profile photos
 * - Requires authentication
 * - Accepts HEIC/HEIF/JPEG/PNG/WebP
 * - Converts all to JPEG with compression
 * - Auto-rotates based on EXIF
 * - Resizes to max 800px (for profile photos)
 * - Uploads to R2 storage
 */
router.post("/api/uploads/profile-photo", jwtAuth, (req: Request, res: Response) => {
  console.log('👤 Profile photo upload started');
  console.log('Headers:', req.headers);
  
  const bb = Busboy({ headers: req.headers });
  let hasFile = false;
  let responseSent = false;

  bb.on("file", (fieldname: string, file: NodeJS.ReadableStream, info: Busboy.FileInfo) => {
    hasFile = true;
    const { mimeType, filename } = info;
    
    console.log('📁 File received:', { fieldname, filename, mimeType });

    const allowed = [
      "image/jpeg",
      "image/jpg", 
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
      ""
    ];
    
    const fileExtension = filename.split('.').pop()?.toLowerCase() || '';
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
    
    const isValidType = allowed.includes(mimeType.toLowerCase()) || allowedExtensions.includes(fileExtension);

    if (!isValidType) {
      console.log('❌ Invalid file type:', mimeType, fileExtension);
      file.resume();
      if (!responseSent) {
        responseSent = true;
        return res.status(400).json({ 
          message: `Desteklenmeyen dosya formatı. JPEG, PNG, WebP veya HEIC kullanın.` 
        });
      }
      return;
    }

    const chunks: Buffer[] = [];
    let totalSize = 0;
    
    file.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
      totalSize += chunk.length;
      
      if (totalSize > 10 * 1024 * 1024) {
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
        
        // Process profile photos smaller (800px) than seeker photos
        console.log('🔄 Processing image...');
        const processedBuffer = await sharp(inputBuffer)
          .rotate()
          .resize({
            width: 800,
            height: 800,
            fit: 'cover' // Square profile photo
          })
          .jpeg({
            quality: 85,
            progressive: true
          })
          .toBuffer();

        console.log('✓ Image processed:', processedBuffer.length, 'bytes');

        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const r2Key = `profiles/${timestamp}-${randomSuffix}.jpg`;

        console.log('☁️ Uploading to R2:', r2Key);
        await uploadBufferToR2(r2Key, processedBuffer, {
          contentType: "image/jpeg",
          cacheControl: "public, max-age=31536000, immutable"
        });

        const cdnUrl = getR2Url(r2Key);
        console.log('✅ Upload complete:', cdnUrl);

        if (!responseSent) {
          responseSent = true;
          return res.json({
            success: true,
            imagePath: r2Key,
            url: cdnUrl
          });
        }

      } catch (error) {
        console.error("❌ Image processing error:", error);
        if (!responseSent) {
          responseSent = true;
          return res.status(500).json({ 
            message: "Fotoğraf işlenirken hata oluştu.",
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

/**
 * Upload endpoint for listing images
 * - Requires authentication
 * - Verifies listing ownership
 * - Accepts multiple images
 * - Converts all to JPEG with compression
 * - Auto-rotates based on EXIF
 * - Resizes to max 1600px width
 * - Uploads to R2 storage
 * - Saves to database
 */
router.post("/api/listings/:id/images", jwtAuth, async (req: Request, res: Response) => {
  const listingId = req.params.id;
  const userId = req.userId;
  
  console.log('🏠 Listing images upload started for listing:', listingId, 'by user:', userId);
  
  // Verify listing ownership BEFORE processing any files
  try {
    const listing = await storage.getListing(listingId);
    if (!listing) {
      return res.status(404).json({ message: "İlan bulunamadı" });
    }
    if (listing.userId !== userId) {
      console.log('❌ Unauthorized: User', userId, 'tried to upload to listing owned by', listing.userId);
      return res.status(403).json({ message: "Bu ilana resim yükleme yetkiniz yok" });
    }
    console.log('✓ Ownership verified for listing:', listingId);
  } catch (error) {
    console.error('❌ Error verifying listing ownership:', error);
    return res.status(500).json({ message: "İlan doğrulanamadı" });
  }
  
  console.log('Headers:', req.headers);
  
  const bb = Busboy({ headers: req.headers });
  const uploadedImages: Array<{ imagePath: string; url: string }> = [];
  let responseSent = false;
  let filesProcessing = 0;
  let filesCompleted = 0;

  bb.on("file", (fieldname: string, file: NodeJS.ReadableStream, info: Busboy.FileInfo) => {
    filesProcessing++;
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
    
    const fileExtension = filename.split('.').pop()?.toLowerCase() || '';
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
    
    const isValidType = allowed.includes(mimeType.toLowerCase()) || allowedExtensions.includes(fileExtension);

    if (!isValidType) {
      console.log('❌ Invalid file type:', mimeType, fileExtension);
      file.resume();
      filesCompleted++;
      return;
    }

    const chunks: Buffer[] = [];
    let totalSize = 0;
    
    file.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
      totalSize += chunk.length;
      
      if (totalSize > 15 * 1024 * 1024) {
        console.log('❌ File too large:', totalSize);
        file.resume();
        filesCompleted++;
      }
    });

    file.on("end", async () => {
      try {
        const inputBuffer = Buffer.concat(chunks);
        console.log('✓ File buffered:', inputBuffer.length, 'bytes');
        
        const processedBuffer = await sharp(inputBuffer)
          .rotate()
          .resize({
            width: 1600,
            withoutEnlargement: true,
            fit: 'inside'
          })
          .jpeg({
            quality: 82,
            progressive: true
          })
          .toBuffer();

        console.log('✓ Image processed:', processedBuffer.length, 'bytes');

        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const r2Key = `listings/${timestamp}-${randomSuffix}.jpg`;

        console.log('☁️ Uploading to R2:', r2Key);
        await uploadBufferToR2(r2Key, processedBuffer, {
          contentType: "image/jpeg",
          cacheControl: "public, max-age=31536000, immutable"
        });

        const cdnUrl = getR2Url(r2Key);
        console.log('✅ Upload complete:', cdnUrl);

        // Save image to database
        try {
          await storage.addListingImage({
            listingId,
            imagePath: r2Key,
            isPrimary: uploadedImages.length === 0 // First image is primary
          });
          console.log('💾 Image saved to database');
        } catch (dbError) {
          console.error('❌ Database save error:', dbError);
          // Continue anyway - image is already uploaded to R2
        }

        uploadedImages.push({
          imagePath: r2Key,
          url: cdnUrl
        });

        filesCompleted++;
        
        // If all files are processed, send response
        if (filesCompleted === filesProcessing && !responseSent) {
          responseSent = true;
          return res.json({
            success: true,
            images: uploadedImages,
            count: uploadedImages.length
          });
        }

      } catch (error) {
        console.error("❌ Image processing error:", error);
        filesCompleted++;
        
        // If all files are processed (even with errors), send response
        if (filesCompleted === filesProcessing && !responseSent) {
          responseSent = true;
          if (uploadedImages.length > 0) {
            return res.json({
              success: true,
              images: uploadedImages,
              count: uploadedImages.length,
              errors: 'Some images failed to process'
            });
          } else {
            return res.status(500).json({ 
              message: "Resimlerin işlenmesinde hata oluştu.",
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }
      }
    });

    file.on("error", (error: Error) => {
      console.error("❌ File stream error:", error);
      filesCompleted++;
    });
  });

  bb.on("finish", () => {
    // Wait a moment for all async operations to complete
    setTimeout(() => {
      if (!responseSent) {
        if (uploadedImages.length > 0) {
          responseSent = true;
          res.json({
            success: true,
            images: uploadedImages,
            count: uploadedImages.length
          });
        } else if (filesProcessing === 0) {
          console.log('❌ No files received');
          responseSent = true;
          res.status(400).json({ 
            message: "Resim seçilmedi." 
          });
        }
      }
    }, 100);
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
