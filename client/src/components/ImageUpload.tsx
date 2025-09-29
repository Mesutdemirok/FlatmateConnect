import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void;
  maxImages?: number;
  acceptedTypes?: string[];
  maxFileSize?: number; // in bytes
}

export default function ImageUpload({ 
  onImagesChange, 
  maxImages = 10, 
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize = 5 * 1024 * 1024 // 5MB
}: ImageUploadProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Please upload images in ${acceptedTypes.join(', ')} format`,
        variant: "destructive"
      });
      return false;
    }

    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `Please upload images smaller than ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const processFiles = useCallback((fileList: FileList) => {
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(fileList).forEach(file => {
      if (images.length + validFiles.length >= maxImages) {
        toast({
          title: "Too many images",
          description: `Maximum ${maxImages} images allowed`,
          variant: "destructive"
        });
        return;
      }

      if (validateFile(file)) {
        validFiles.push(file);
        const preview = URL.createObjectURL(file);
        newPreviews.push(preview);
      }
    });

    if (validFiles.length > 0) {
      const updatedImages = [...images, ...validFiles];
      const updatedPreviews = [...previews, ...newPreviews];
      
      setImages(updatedImages);
      setPreviews(updatedPreviews);
      onImagesChange(updatedImages);
    }
  }, [images, previews, maxImages, onImagesChange, toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    
    // Clean up object URL
    URL.revokeObjectURL(previews[index]);
    
    setImages(updatedImages);
    setPreviews(updatedPreviews);
    onImagesChange(updatedImages);
  };

  const moveToFirst = (index: number) => {
    if (index === 0) return;
    
    const updatedImages = [images[index], ...images.filter((_, i) => i !== index)];
    const updatedPreviews = [previews[index], ...previews.filter((_, i) => i !== index)];
    
    setImages(updatedImages);
    setPreviews(updatedPreviews);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4" data-testid="image-upload-container">
      <Label>Property Images</Label>
      
      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        data-testid="image-upload-dropzone"
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="text-lg font-medium text-foreground">
              Drop images here or click to upload
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PNG, JPG or WebP up to {Math.round(maxFileSize / 1024 / 1024)}MB
            </p>
          </div>
          <Button type="button" variant="outline" data-testid="upload-button">
            <input
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              data-testid="file-input"
            />
            Choose Images
          </Button>
        </div>
      </div>

      {/* Image previews */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <Label>Uploaded Images ({images.length}/{maxImages})</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <Card key={index} className="relative overflow-hidden" data-testid={`image-preview-${index}`}>
                <CardContent className="p-0 relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  
                  {/* Primary image indicator */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Primary
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {index > 0 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-6 w-6 bg-card/80 hover:bg-card"
                        onClick={() => moveToFirst(index)}
                        data-testid={`make-primary-${index}`}
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-6 w-6"
                      onClick={() => removeImage(index)}
                      data-testid={`remove-image-${index}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Image info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                    {images[index]?.name}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {index === 0 && images.length > 1 && (
            <p className="text-xs text-muted-foreground">
              The first image will be used as the primary image. Click the star icon to make any image primary.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
