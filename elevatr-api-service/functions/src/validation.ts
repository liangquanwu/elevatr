import { HttpsError } from "firebase-functions/v2/https";

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationException extends Error {
  constructor(public errors: ValidationError[]) {
    super("Validation failed");
    this.name = "ValidationException";
  }
}

interface UserProfileData {
  accountType?: 'applicant' | 'startup';
  email?: string;
  name?: string;
  [key: string]: any;
}

interface VideoData {
  videoType: 'applicant' | 'startup';
  [key: string]: any;
}

interface FileUploadData {
  fileExtension: string;
  contentType: string;
  [key: string]: any;
}

export const validateUserProfile = (data: UserProfileData): void => {
  const errors: ValidationError[] = [];
  
  // Validate account type
  if (data.accountType && !['applicant', 'startup'].includes(data.accountType)) {
    errors.push({
      field: 'accountType',
      message: 'Account type must be either "applicant" or "startup"'
    });
  }

  // Validate email if provided
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({
      field: 'email',
      message: 'Invalid email format'
    });
  }

  // Validate name if provided
  if (data.name && (typeof data.name !== 'string' || data.name.length < 2)) {
    errors.push({
      field: 'name',
      message: 'Name must be at least 2 characters long'
    });
  }

  if (errors.length > 0) {
    throw new ValidationException(errors);
  }
};

export const validateVideoData = (data: VideoData): void => {
  const errors: ValidationError[] = [];

  if (!data.videoType || !['applicant', 'startup'].includes(data.videoType)) {
    errors.push({
      field: 'videoType',
      message: 'Video type must be either "applicant" or "startup"'
    });
  }

  if (errors.length > 0) {
    throw new ValidationException(errors);
  }
};

export const validateFileUpload = (data: FileUploadData): void => {
  const errors: ValidationError[] = [];

  if (!data.fileExtension) {
    errors.push({
      field: 'fileExtension',
      message: 'File extension is required'
    });
  }

  if (!data.contentType) {
    errors.push({
      field: 'contentType',
      message: 'Content type is required'
    });
  }

  if (errors.length > 0) {
    throw new ValidationException(errors);
  }
};

export const handleValidationError = (error: unknown): HttpsError => {
  if (error instanceof ValidationException) {
    return new HttpsError(
      'invalid-argument',
      'Validation failed',
      { errors: error.errors }
    );
  }
  return new HttpsError('internal', 'An unexpected error occurred');
}; 