import { fetchStudentsArr } from '../utilities/firebase/fetchStudentsArr.js';
import { generateCSV } from '../utilities/csv/generateCSV.js';
import { asyncHandler, DatabaseError } from '../middleware/errorHandler.js';
import logger from '../utilities/logger.js';
import metrics from '../utilities/metrics.js';

/**
 * Generate and download CSV endpoint.
 * Fetches all student records and generates a CSV file.
 */
export const generate = asyncHandler(async (req, res) => {
  const requestLogger = logger.child({ requestId: req.requestId });
  const startTime = Date.now();
  
  metrics.increment('generateRequests');

  try {
    requestLogger.info('Fetching student records for CSV generation');
    
    const students = await fetchStudentsArr();
    
    if (!students || students.length === 0) {
      requestLogger.warn('No student records found');
      return res.status(404).json({
        success: false,
        error: {
          code: 'NO_DATA',
          message: 'No student records found in the database',
        },
        requestId: req.requestId,
      });
    }

    const csvBuffer = generateCSV(students);
    
    const processingTime = Date.now() - startTime;
    
    requestLogger.info('CSV generated successfully', {
      recordCount: students.length,
      processingTimeMs: processingTime,
      fileSizeBytes: csvBuffer.length,
    });

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=marks_${Date.now()}.csv`);
    res.setHeader('Content-Length', csvBuffer.length);
    res.setHeader('X-Record-Count', students.length);
    
    res.send(csvBuffer);
    
  } catch (error) {
    requestLogger.error('CSV generation failed', { error });
    throw new DatabaseError('Failed to generate CSV report', error);
  }
});
