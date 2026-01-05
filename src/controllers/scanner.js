import { convertRomanNumeralToInteger } from "../utilities/extractRelevantInformation.js";
import { createRectangles } from "../utilities/tesseract/createRectangles.js";
import { preProcessImage } from "../utilities/sharp/preProcessImage.js";
import { uploadStudentData } from "../utilities/firebase/uploadStudentData.js";
import { checkDuplicate } from "../utilities/firebase/duplicateCheck.js";
import { workerPool } from "../utilities/tesseract/workerPool.js";
import { asyncHandler, ProcessingError, ValidationError } from "../middleware/errorHandler.js";
import { validateImageInput } from "../middleware/validation.js";
import { scanRateLimiter } from "../middleware/rateLimiter.js";
import logger from "../utilities/logger.js";
import metrics from "../utilities/metrics.js";

/**
 * Extracts text from image regions using the worker pool.
 * Returns both text and confidence scores.
 */
async function extractWithConfidence(image, rectangles) {
    const results = await workerPool.recognize(image, rectangles);
    return results.map((r) => ({
        text: r.text.replace(/\n$/, ""), // Remove trailing newline
        confidence: r.confidence,
    }));
}

/**
 * Legacy extraction for backward compatibility.
 */
async function extractText(image, rectangles) {
    const results = await extractWithConfidence(image, rectangles);
    return results.map((r) => r.text);
}

/**
 * Main scan endpoint handler.
 * Processes a single marksheet image and extracts student data.
 */
export const scan = [
    scanRateLimiter,
    validateImageInput,
    asyncHandler(async (req, res) => {
        const startTime = Date.now();
        const requestLogger = logger.child({ requestId: req.requestId });

        metrics.increment("scanRequests");
        metrics.set("activeRequests", metrics.gauges.activeRequests + 1);

        try {
            const base64versionImage = req.body.image;

            // Pre-process the image
            requestLogger.debug("Starting image preprocessing");
            const preProcessedImage = await preProcessImage(base64versionImage);

            // Validate image type
            const imageCheckResults = await extractWithConfidence(preProcessedImage, createRectangles("image-check"));

            if (imageCheckResults[0].text !== "Semester") {
                requestLogger.warn("Invalid image type detected", {
                    detected: imageCheckResults[0].text,
                    confidence: imageCheckResults[0].confidence,
                });

                return res.json({
                    success: false,
                    ocrResponse: "Error",
                    formattedString: "Wrong image provided. Please upload a valid semester marksheet.",
                    confidence: imageCheckResults[0].confidence,
                });
            }

            // Extract semester number
            const semesterResults = await extractWithConfidence(preProcessedImage, createRectangles("semester"));
            const currentSemesterNumber = convertRomanNumeralToInteger(semesterResults[0].text);

            // Extract personal information in parallel with marks
            const [personalInfo, gpaInfo, theoryResults, practicalResults] = await Promise.all([
                extractText(preProcessedImage, createRectangles("personal-info")),
                extractText(preProcessedImage, createRectangles("gpa")),
                extractWithConfidence(preProcessedImage, createRectangles("theory")),
                extractWithConfidence(preProcessedImage, createRectangles("practical")),
            ]);

            const [registrationNumber, studentName, fatherName, motherName, courseName] = personalInfo;
            const [sgpa, cgpa] = gpaInfo;

            // Parse theory subjects
            const theory = [];
            for (let i = 0; i < theoryResults.length; i += 2) {
                if (theoryResults[i]?.text && theoryResults[i + 1]?.text) {
                    theory.push({
                        code: theoryResults[i].text,
                        marks: theoryResults[i + 1].text,
                        confidence: (theoryResults[i].confidence + theoryResults[i + 1].confidence) / 2,
                    });
                }
            }

            // Parse practical subjects
            const practical = [];
            for (let i = 0; i < practicalResults.length; i += 2) {
                if (practicalResults[i]?.text && practicalResults[i + 1]?.text) {
                    practical.push({
                        code: practicalResults[i].text,
                        marks: practicalResults[i + 1].text,
                        confidence: (practicalResults[i].confidence + practicalResults[i + 1].confidence) / 2,
                    });
                }
            }

            // Calculate average confidence
            const allConfidences = [...theory.map((t) => t.confidence), ...practical.map((p) => p.confidence)];
            const avgConfidence =
                allConfidences.length > 0 ? allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length : 0;

            metrics.observe("ocrConfidence", avgConfidence);

            // Upload records with duplicate detection
            let uploadedCount = 0;
            let skippedCount = 0;

            const uploadPromises = [];

            // Process theory subjects
            for (const { code, marks } of theory) {
                if (code && marks) {
                    uploadPromises.push(
                        (async () => {
                            const duplicate = await checkDuplicate({
                                regNo: registrationNumber,
                                semester: currentSemesterNumber,
                                subCode: code,
                            });

                            if (duplicate) {
                                skippedCount++;
                                metrics.increment("duplicatesSkipped");
                                requestLogger.debug("Skipping duplicate record", { code, regNo: registrationNumber });
                                return;
                            }

                            await uploadStudentData({
                                regNo: registrationNumber,
                                studentName,
                                fatherName,
                                motherName,
                                courseName,
                                semester: currentSemesterNumber,
                                subCode: code,
                                totalMarks: marks,
                                isPractical: false,
                                sgpa,
                                cgpa,
                            });
                            uploadedCount++;
                            metrics.increment("recordsUploaded");
                        })()
                    );
                }
            }

            // Process practical subjects
            for (const { code, marks } of practical) {
                if (code && marks) {
                    uploadPromises.push(
                        (async () => {
                            const duplicate = await checkDuplicate({
                                regNo: registrationNumber,
                                semester: currentSemesterNumber,
                                subCode: code,
                            });

                            if (duplicate) {
                                skippedCount++;
                                metrics.increment("duplicatesSkipped");
                                return;
                            }

                            await uploadStudentData({
                                regNo: registrationNumber,
                                studentName,
                                fatherName,
                                motherName,
                                courseName,
                                semester: currentSemesterNumber,
                                subCode: code,
                                totalMarks: marks,
                                isPractical: true,
                                sgpa,
                                cgpa,
                            });
                            uploadedCount++;
                            metrics.increment("recordsUploaded");
                        })()
                    );
                }
            }

            await Promise.all(uploadPromises);

            // Build formatted string for display (backward compatible)
            const formatted = `${registrationNumber} | ${studentName} | ${fatherName} | ${motherName}
${currentSemesterNumber} | ${courseName} | ${sgpa} | ${cgpa}
Theory: ${theory.map((t) => `${t.code}: ${t.marks}`).join(" | ")}
Practical: ${practical.map((p) => `${p.code}: ${p.marks}`).join(" | ")}`;

            const processingTime = Date.now() - startTime;
            metrics.observe("scanDuration", processingTime);
            metrics.increment("successfulScans");

            requestLogger.info("Scan completed successfully", {
                registrationNumber,
                semester: currentSemesterNumber,
                recordsUploaded: uploadedCount,
                recordsSkipped: skippedCount,
                avgConfidence: Math.round(avgConfidence * 100) / 100,
                processingTimeMs: processingTime,
            });

            res.json({
                success: true,
                ocrResponse: "Success",
                formattedString: formatted,
                data: {
                    student: {
                        registrationNumber,
                        name: studentName,
                        fatherName,
                        motherName,
                        course: courseName,
                        semester: currentSemesterNumber,
                        sgpa: parseFloat(sgpa),
                        cgpa: parseFloat(cgpa),
                    },
                    subjects: {
                        theory: theory.map((t) => ({ code: t.code, marks: parseInt(t.marks) || t.marks })),
                        practical: practical.map((p) => ({ code: p.code, marks: parseInt(p.marks) || p.marks })),
                    },
                    meta: {
                        avgConfidence: Math.round(avgConfidence * 100) / 100,
                        recordsUploaded: uploadedCount,
                        recordsSkipped: skippedCount,
                        processingTimeMs: processingTime,
                    },
                },
                requestId: req.requestId,
            });
        } catch (error) {
            metrics.increment("failedScans");
            requestLogger.error("Scan processing failed", { error });

            if (error.message?.includes("dimensions")) {
                throw new ValidationError(error.message);
            }

            throw new ProcessingError("Failed to process marksheet image", {
                originalError: error.message,
            });
        } finally {
            metrics.set("activeRequests", Math.max(0, metrics.gauges.activeRequests - 1));
        }
    }),
];
