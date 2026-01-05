import { convertRomanNumeralToInteger } from '../utilities/extractRelevantInformation.js';
import { createRectangles } from '../utilities/tesseract/createRectangles.js';
import { preProcessImage } from '../utilities/sharp/preProcessImage.js';
import { uploadStudentData } from '../utilities/firebase/uploadStudentData.js';
import { checkDuplicatesBatch, generateRecordKey } from '../utilities/firebase/duplicateCheck.js';
import { workerPool } from '../utilities/tesseract/workerPool.js';
import { asyncHandler, ProcessingError } from '../middleware/errorHandler.js';
import { validateBatchInput } from '../middleware/validation.js';
import { scanRateLimiter } from '../middleware/rateLimiter.js';
import logger from '../utilities/logger.js';
import metrics from '../utilities/metrics.js';

/**
 * Processes a single image and returns extracted data.
 */
async function processSingleImage(base64Image, index, requestLogger) {
  try {
    const preProcessedImage = await preProcessImage(base64Image);

    // Validate image type
    const imageCheck = await workerPool.recognize(preProcessedImage, createRectangles('image-check'));
    if (imageCheck[0].text.trim() !== 'Semester') {
      return {
        index,
        success: false,
        error: 'Invalid image format - not a semester marksheet',
      };
    }

    // Extract all data
    const [semesterResult, personalInfo, gpaInfo, theoryResults, practicalResults] = await Promise.all([
      workerPool.recognize(preProcessedImage, createRectangles('semester')),
      workerPool.recognize(preProcessedImage, createRectangles('personal-info')),
      workerPool.recognize(preProcessedImage, createRectangles('gpa')),
      workerPool.recognize(preProcessedImage, createRectangles('theory')),
      workerPool.recognize(preProcessedImage, createRectangles('practical')),
    ]);

    const semester = convertRomanNumeralToInteger(semesterResult[0].text.trim());
    const [regNo, name, fatherName, motherName, courseName] = personalInfo.map(r => r.text.trim());
    const [sgpa, cgpa] = gpaInfo.map(r => r.text.trim());

    // Parse subjects
    const subjects = [];
    for (let i = 0; i < theoryResults.length; i += 2) {
      if (theoryResults[i]?.text && theoryResults[i + 1]?.text) {
        subjects.push({
          code: theoryResults[i].text.trim(),
          marks: theoryResults[i + 1].text.trim(),
          isPractical: false,
        });
      }
    }
    for (let i = 0; i < practicalResults.length; i += 2) {
      if (practicalResults[i]?.text && practicalResults[i + 1]?.text) {
        subjects.push({
          code: practicalResults[i].text.trim(),
          marks: practicalResults[i + 1].text.trim(),
          isPractical: true,
        });
      }
    }

    return {
      index,
      success: true,
      data: {
        regNo,
        name,
        fatherName,
        motherName,
        courseName,
        semester,
        sgpa,
        cgpa,
        subjects,
      },
    };
  } catch (error) {
    requestLogger.error('Error processing image in batch', { index, error });
    return {
      index,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Batch scan endpoint handler.
 * Processes multiple marksheet images in parallel.
 */
export const scanBatch = [
  scanRateLimiter,
  validateBatchInput,
  asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const requestLogger = logger.child({ requestId: req.requestId });
    const { images } = req.body;

    metrics.increment('batchRequests');
    metrics.increment('scanRequests', images.length);

    requestLogger.info('Starting batch scan', { imageCount: images.length });

    // Process all images in parallel (limited by worker pool)
    const processingPromises = images.map((image, index) => 
      processSingleImage(image, index, requestLogger)
    );

    const results = await Promise.all(processingPromises);

    // Separate successful and failed results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    // Collect all records for batch duplicate check
    const allRecords = [];
    for (const result of successful) {
      for (const subject of result.data.subjects) {
        allRecords.push({
          ...result.data,
          subCode: subject.code,
          totalMarks: subject.marks,
          isPractical: subject.isPractical,
        });
      }
    }

    // Check for duplicates in batch
    const existingDuplicates = await checkDuplicatesBatch(allRecords);

    // Upload non-duplicate records
    let uploadedCount = 0;
    let skippedCount = 0;

    const uploadPromises = allRecords.map(async (record) => {
      const key = generateRecordKey(record);
      
      if (existingDuplicates.has(key)) {
        skippedCount++;
        metrics.increment('duplicatesSkipped');
        return { uploaded: false, reason: 'duplicate' };
      }

      try {
        await uploadStudentData({
          regNo: record.regNo,
          studentName: record.name,
          fatherName: record.fatherName,
          motherName: record.motherName,
          courseName: record.courseName,
          semester: record.semester,
          subCode: record.subCode,
          totalMarks: record.totalMarks,
          isPractical: record.isPractical,
          sgpa: record.sgpa,
          cgpa: record.cgpa,
        });
        uploadedCount++;
        metrics.increment('recordsUploaded');
        return { uploaded: true };
      } catch (error) {
        return { uploaded: false, reason: error.message };
      }
    });

    await Promise.all(uploadPromises);

    const processingTime = Date.now() - startTime;
    metrics.observe('scanDuration', processingTime / images.length);
    metrics.increment('successfulScans', successful.length);
    metrics.increment('failedScans', failed.length);

    requestLogger.info('Batch scan completed', {
      total: images.length,
      successful: successful.length,
      failed: failed.length,
      recordsUploaded: uploadedCount,
      recordsSkipped: skippedCount,
      processingTimeMs: processingTime,
    });

    res.json({
      success: true,
      summary: {
        total: images.length,
        successful: successful.length,
        failed: failed.length,
        recordsUploaded: uploadedCount,
        recordsSkipped: skippedCount,
        processingTimeMs: processingTime,
      },
      results: results.map(r => ({
        index: r.index,
        success: r.success,
        ...(r.success ? {
          registrationNumber: r.data.regNo,
          studentName: r.data.name,
          semester: r.data.semester,
          subjectCount: r.data.subjects.length,
        } : {
          error: r.error,
        }),
      })),
      requestId: req.requestId,
    });
  }),
];
