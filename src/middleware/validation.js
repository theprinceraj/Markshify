import { ValidationError } from './errorHandler.js';
import logger from '../utilities/logger.js';

/**
 * Validates image data in request body.
 * Checks for presence, format, and size constraints.
 */
export function validateImageInput(req, res, next) {
  const { image } = req.body;
  const errors = [];

  // Check if image is provided
  if (!image) {
    errors.push({
      field: 'image',
      message: 'Image data is required',
    });
    throw new ValidationError('Validation failed', errors);
  }

  // Validate base64 format
  const base64Regex = /^data:image\/(png|jpeg|jpg|webp);base64,/;
  if (!base64Regex.test(image)) {
    errors.push({
      field: 'image',
      message: 'Invalid image format. Expected base64 encoded PNG, JPEG, or WebP',
    });
    throw new ValidationError('Validation failed', errors);
  }

  // Check image size (approximate - base64 is ~33% larger than binary)
  const base64Data = image.split(',')[1];
  const sizeInBytes = (base64Data.length * 3) / 4;
  const maxSizeBytes = 15 * 1024 * 1024; // 15MB limit

  if (sizeInBytes > maxSizeBytes) {
    errors.push({
      field: 'image',
      message: `Image size exceeds maximum limit of 15MB. Received: ${(sizeInBytes / (1024 * 1024)).toFixed(2)}MB`,
    });
    throw new ValidationError('Validation failed', errors);
  }

  logger.debug('Image validation passed', {
    requestId: req.requestId,
    imageSizeMB: (sizeInBytes / (1024 * 1024)).toFixed(2),
  });

  next();
}

/**
 * Validates batch processing request.
 */
export function validateBatchInput(req, res, next) {
  const { images } = req.body;
  const errors = [];

  if (!images || !Array.isArray(images)) {
    errors.push({
      field: 'images',
      message: 'Images array is required',
    });
    throw new ValidationError('Validation failed', errors);
  }

  if (images.length === 0) {
    errors.push({
      field: 'images',
      message: 'At least one image is required',
    });
    throw new ValidationError('Validation failed', errors);
  }

  const maxBatchSize = parseInt(process.env.MAX_BATCH_SIZE) || 10;
  if (images.length > maxBatchSize) {
    errors.push({
      field: 'images',
      message: `Batch size exceeds maximum of ${maxBatchSize} images`,
    });
    throw new ValidationError('Validation failed', errors);
  }

  // Validate each image in the batch
  const base64Regex = /^data:image\/(png|jpeg|jpg|webp);base64,/;
  images.forEach((image, index) => {
    if (!base64Regex.test(image)) {
      errors.push({
        field: `images[${index}]`,
        message: 'Invalid image format',
      });
    }
  });

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  logger.debug('Batch validation passed', {
    requestId: req.requestId,
    batchSize: images.length,
  });

  next();
}

/**
 * Sanitizes string input to prevent injection attacks.
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
}
