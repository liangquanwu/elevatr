import { HttpsError } from "firebase-functions/v2/https";
import { logSecurityEvent, SecurityEventType } from './securityLogger';

type FileType = 'pdf' | 'video' | 'image';
type ContentType = 'application/pdf' | 'video/mp4' | 'video/quicktime' | 'video/x-msvideo' | 'image/jpeg' | 'image/png' | 'image/gif';

// File size limits in bytes
const MAX_FILE_SIZES: Record<FileType, number> = {
  pdf: 10 * 1024 * 1024, // 10MB for PDFs
  video: 100 * 1024 * 1024, // 100MB for videos
  image: 5 * 1024 * 1024, // 5MB for images
};

// Allowed file types and their MIME types
const ALLOWED_FILE_TYPES: Record<FileType, ContentType[]> = {
  pdf: ['application/pdf'],
  video: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
  image: ['image/jpeg', 'image/png', 'image/gif'],
};

// Expected file extensions for each content type
const EXPECTED_EXTENSIONS: Record<ContentType, string> = {
  'application/pdf': 'pdf',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/x-msvideo': 'avi',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
} as const;

/**
 * Maximum file size allowed in bytes (10MB)
 * @constant
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Allowed file types for upload
 * @constant
 */
const ALLOWED_FILE_TYPES_ARRAY = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

/**
 * Validates a file upload request
 * @param file - The file to validate
 * @param userId - The ID of the user uploading the file
 * @param ip - The IP address of the user
 * @returns Promise that resolves if validation passes, rejects with error if validation fails
 */
export const validateFileUpload = async (
  file: Express.Multer.File,
  userId: string,
  ip: string
): Promise<void> => {
  // Check file size
  if (file.size > MAX_FILE_SIZES[file.mimetype.startsWith('video/') ? 'video' : 
                                file.mimetype.startsWith('image/') ? 'image' : 'pdf']) {
    logSecurityEvent({
      type: SecurityEventType.FILE_UPLOAD,
      userId,
      ip,
      details: {
        error: 'File too large',
        size: file.size,
        maxSize: MAX_FILE_SIZES[file.mimetype.startsWith('video/') ? 'video' : 
                               file.mimetype.startsWith('image/') ? 'image' : 'pdf']
      }
    });
    throw new Error('File size exceeds limit');
  }

  // Check file type
  const fileType = file.mimetype.startsWith('video/') ? 'video' : 
                  file.mimetype.startsWith('image/') ? 'image' : 'pdf';
                  
  if (!ALLOWED_FILE_TYPES[fileType].includes(file.mimetype as ContentType)) {
    logSecurityEvent({
      type: SecurityEventType.FILE_UPLOAD,
      userId,
      ip,
      details: {
        error: 'Invalid file type',
        type: file.mimetype,
        allowedTypes: ALLOWED_FILE_TYPES[fileType]
      }
    });
    throw new Error('File type not allowed');
  }

  // Log successful validation
  logSecurityEvent({
    type: SecurityEventType.FILE_UPLOAD,
    userId,
    ip,
    details: {
      success: true,
      size: file.size,
      type: file.mimetype
    }
  });
};

export const validateFileUploadRequest = (
  fileExtension: string,
  contentType: string,
  fileType: FileType
): void => {
  const errors: string[] = [];

  if (!fileExtension) {
    errors.push('File extension is required');
  }

  if (!contentType) {
    errors.push('Content type is required');
  }

  if (!ALLOWED_FILE_TYPES[fileType].some(type => contentType.startsWith(type))) {
    errors.push(`Invalid content type for ${fileType} files`);
  }

  const expectedExtension = EXPECTED_EXTENSIONS[contentType as ContentType];
  if (expectedExtension && fileExtension.toLowerCase() !== expectedExtension) {
    errors.push(`File extension ${fileExtension} does not match content type ${contentType}`);
  }

  if (errors.length > 0) {
    throw new HttpsError('invalid-argument', errors.join(', '));
  }
};

export const getMaxFileSize = (fileType: FileType): number => {
  return MAX_FILE_SIZES[fileType];
};

export const generateSecureFileName = (uid: string, originalName: string): string => {
  if (!uid || typeof uid !== 'string') {
    throw new HttpsError('invalid-argument', 'Invalid user ID');
  }

  // Remove any path information from the original name
  const cleanName = originalName.replace(/^.*[\\\/]/, '');
  
  // Generate a random string
  const randomString = Math.random().toString(36).substring(2, 15);
  
  // Get the file extension
  const extension = cleanName.split('.').pop()?.toLowerCase() || '';
  
  // Combine everything
  return `${uid}-${randomString}.${extension}`;
}; 