import sharp from "sharp";
import logger from "../logger.js";

// Minimum dimensions for valid marksheet images
const MIN_WIDTH = 2480;
const MIN_HEIGHT = 3505;

// Extraction region configuration
const EXTRACTION_CONFIG = {
    width: 2113,
    height: 1807,
    top: 805,
    left: 181,
};

/**
 * Pre-processes an image for OCR extraction.
 * Applies optimizations for better text recognition.
 *
 * @param {string} base64Image - Base64 encoded image string
 * @returns {Promise<Buffer>} Processed image buffer
 */
export async function preProcessImage(base64Image) {
    const startTime = Date.now();

    try {
        // Parse base64 string
        const base64Data = base64Image.split(";base64,").pop();
        if (!base64Data) {
            throw new Error("Invalid base64 image format");
        }

        const imageBuffer = Buffer.from(base64Data, "base64");
        let sharpInstance = sharp(imageBuffer);

        // Get metadata and validate dimensions
        const metadata = await sharpInstance.metadata();

        logger.debug("Image metadata", {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            space: metadata.space,
        });

        if (metadata.width < MIN_WIDTH || metadata.height < MIN_HEIGHT) {
            throw new Error(
                `Image dimensions are insufficient for extraction. ` +
                    `Required: ${MIN_WIDTH}x${MIN_HEIGHT}, ` +
                    `Received: ${metadata.width}x${metadata.height}`
            );
        }

        // Apply image processing pipeline
        let processedBuffer = await sharpInstance
            .greyscale() // Convert to grayscale for OCR
            .extract(EXTRACTION_CONFIG) // Extract relevant region
            .normalize() // Normalize contrast
            .sharpen({ sigma: 1.0 }) // Slight sharpening for text clarity
            .png({ compressionLevel: 6 }) // Convert to PNG
            .toBuffer({ resolveWithObject: false });

        // Add border for edge detection
        const finalBuffer = await addBorder(processedBuffer, 5, {
            r: 0,
            g: 0,
            b: 0,
            alpha: 1,
        });

        const processingTime = Date.now() - startTime;
        logger.debug("Image preprocessing completed", {
            originalSize: imageBuffer.length,
            processedSize: finalBuffer.length,
            processingTimeMs: processingTime,
        });

        return finalBuffer;
    } catch (error) {
        logger.error("Image preprocessing failed", { error });
        throw error;
    }
}

/**
 * Adds a colored border around an image.
 * Helps with edge detection during OCR.
 *
 * @param {Buffer} buffer - Image buffer
 * @param {number} borderSize - Border width in pixels
 * @param {Object} borderColor - Border color {r, g, b, alpha}
 * @returns {Promise<Buffer>} Image with border
 */
async function addBorder(buffer, borderSize, borderColor) {
    try {
        const img = sharp(buffer);
        const metadata = await img.metadata();

        const newWidth = metadata.width + borderSize * 2;
        const newHeight = metadata.height + borderSize * 2;

        const newImg = sharp({
            create: {
                width: newWidth,
                height: newHeight,
                channels: 4,
                background: borderColor,
            },
        }).png();

        const result = await newImg
            .composite([
                {
                    input: buffer,
                    top: borderSize,
                    left: borderSize,
                },
            ])
            .png()
            .toBuffer();

        return result;
    } catch (error) {
        logger.error("Error adding border to image", { error });
        throw error;
    }
}

/**
 * Validates if an image meets the requirements for processing.
 *
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<Object>} Validation result
 */
export async function validateImage(base64Image) {
    try {
        const base64Data = base64Image.split(";base64,").pop();
        const imageBuffer = Buffer.from(base64Data, "base64");
        const metadata = await sharp(imageBuffer).metadata();

        const isValid = metadata.width >= MIN_WIDTH && metadata.height >= MIN_HEIGHT;

        return {
            valid: isValid,
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            minRequired: {
                width: MIN_WIDTH,
                height: MIN_HEIGHT,
            },
        };
    } catch (error) {
        return {
            valid: false,
            error: error.message,
        };
    }
}
