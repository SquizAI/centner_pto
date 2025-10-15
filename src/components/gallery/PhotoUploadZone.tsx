'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  PhotoUploadFile,
  PhotoUploadError,
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
} from '@/types/gallery.types';

interface PhotoUploadZoneProps {
  onFilesSelected: (files: PhotoUploadFile[]) => void;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

export function PhotoUploadZone({
  onFilesSelected,
  maxFiles = 20,
  className,
  disabled = false,
}: PhotoUploadZoneProps) {
  const [files, setFiles] = React.useState<PhotoUploadFile[]>([]);
  const [errors, setErrors] = React.useState<PhotoUploadError[]>([]);

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle accepted files
      const validFiles: PhotoUploadFile[] = acceptedFiles.map((file) => {
        const uploadFile = file as PhotoUploadFile;
        uploadFile.preview = URL.createObjectURL(file);
        return uploadFile;
      });

      // Handle rejected files
      const newErrors: PhotoUploadError[] = rejectedFiles.map((rejected) => ({
        file: rejected.file.name,
        error: rejected.errors[0]?.message || 'Invalid file',
      }));

      setFiles((prev) => [...prev, ...validFiles]);
      setErrors((prev) => [...prev, ...newErrors]);
      onFilesSelected([...files, ...validFiles]);
    },
    [files, onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles,
    disabled,
    multiple: true,
  });

  const removeFile = React.useCallback(
    (index: number) => {
      setFiles((prev) => {
        const newFiles = [...prev];
        // Revoke preview URL to avoid memory leaks
        if (newFiles[index].preview) {
          URL.revokeObjectURL(newFiles[index].preview!);
        }
        newFiles.splice(index, 1);
        onFilesSelected(newFiles);
        return newFiles;
      });
    },
    [onFilesSelected]
  );

  const clearErrors = React.useCallback(() => {
    setErrors([]);
  }, []);

  // Cleanup preview URLs on unmount
  React.useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-all duration-200',
          'flex flex-col items-center justify-center p-12 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          isDragActive
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
        )}
      >
        <input {...getInputProps()} />

        <motion.div
          initial={false}
          animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
          className="flex flex-col items-center text-center"
        >
          <div
            className={cn(
              'mb-4 p-4 rounded-full transition-colors',
              isDragActive ? 'bg-primary/10' : 'bg-muted'
            )}
          >
            <Upload
              className={cn(
                'h-10 w-10 transition-colors',
                isDragActive ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-hidden="true"
            />
          </div>

          <h3 className="text-lg font-semibold mb-2">
            {isDragActive ? 'Drop photos here' : 'Upload Photos'}
          </h3>

          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Drag and drop photos here, or click to browse your files
          </p>

          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline" className="text-xs">
              Max {maxFiles} files
            </Badge>
            <Badge variant="outline" className="text-xs">
              Max {MAX_FILE_SIZE / 1024 / 1024}MB per file
            </Badge>
            <Badge variant="outline" className="text-xs">
              JPG, PNG, WEBP, GIF
            </Badge>
          </div>
        </motion.div>
      </div>

      {/* Error Messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-destructive mb-2">
                  Upload Errors
                </h4>
                <ul className="space-y-1 text-sm text-destructive/90">
                  {errors.map((error, index) => (
                    <li key={index} className="truncate">
                      <span className="font-medium">{error.file}:</span> {error.error}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearErrors}
                className="flex-shrink-0 hover:bg-destructive/20"
                aria-label="Clear errors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Preview Grid */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">
              Selected Files ({files.length})
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                files.forEach((file) => {
                  if (file.preview) URL.revokeObjectURL(file.preview);
                });
                setFiles([]);
                onFilesSelected([]);
              }}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <AnimatePresence>
              {files.map((file, index) => (
                <motion.div
                  key={file.name + index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="relative group"
                >
                  {/* Preview Image */}
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    {file.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Remove Button */}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    {/* Success Badge */}
                    <div className="absolute bottom-2 left-2">
                      <Badge
                        variant="secondary"
                        className="text-xs flex items-center gap-1 bg-green-500/90 text-white"
                      >
                        <Check className="h-3 w-3" />
                        Ready
                      </Badge>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="mt-2 px-1">
                    <p className="text-xs font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

// Upload progress component for showing upload status
interface UploadProgressProps {
  files: { name: string; progress: number; status: 'uploading' | 'success' | 'error' }[];
  className?: string;
}

export function UploadProgress({ files, className }: UploadProgressProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="font-semibold text-sm mb-3">Upload Progress</h4>
      <AnimatePresence>
        {files.map((file, index) => (
          <motion.div
            key={file.name + index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card"
          >
            {/* Status Icon */}
            <div className="flex-shrink-0">
              {file.status === 'uploading' && (
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
              {file.status === 'success' && (
                <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              {file.status === 'error' && (
                <div className="h-5 w-5 bg-destructive rounded-full flex items-center justify-center">
                  <X className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <div className="mt-1 w-full bg-muted rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${file.progress}%` }}
                  className={cn(
                    'h-full rounded-full transition-colors',
                    file.status === 'uploading' && 'bg-primary',
                    file.status === 'success' && 'bg-green-500',
                    file.status === 'error' && 'bg-destructive'
                  )}
                />
              </div>
            </div>

            {/* Progress Percentage */}
            <div className="flex-shrink-0 text-sm font-medium text-muted-foreground">
              {file.progress}%
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
