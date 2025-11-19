# Seed Images

This directory contains placeholder images for the seed dataset.

## Required Images

Place the following images in this directory before running the seed script:

1. **admin-avatar.jpg** - Avatar for admin user
2. **lister-avatar.jpg** - Avatar for room lister user (Ayşe)
3. **seeker-avatar.jpg** - Avatar for room seeker user (Mehmet)
4. **kadikoy1.jpg** - First photo of the Kadıköy room listing
5. **kadikoy2.jpg** - Second photo of the Kadıköy room listing

## Image Specifications

- **Format**: JPEG or PNG
- **Avatar images**: Recommended 400x400px minimum
- **Listing images**: Recommended 1200x800px minimum
- **File size**: Keep under 2MB for optimal performance

## Alternative: Use Cloudflare R2

If using Cloudflare R2 for image storage in production:
1. Upload these images to your R2 bucket under the `seed/` prefix
2. The seed script references `/seed/` paths which will be resolved via your R2_PUBLIC_URL
3. Ensure your CDN is configured to serve files from the `seed/` folder

## Creating Placeholder Images

For development, you can use free stock photos from:
- Unsplash (https://unsplash.com)
- Pexels (https://www.pexels.com)
- Or use https://placeholder.com for quick placeholders
