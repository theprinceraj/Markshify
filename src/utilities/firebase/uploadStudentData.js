import { db } from "./firebaseInitialize.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import logger from "../logger.js";

/**
 * Uploads student data to Firebase Firestore.
 * Includes validation, error handling, and metadata.
 *
 * @param {Object} params - Student data
 * @returns {Promise<string>} Document ID of the created record
 */
export async function uploadStudentData({
    regNo,
    studentName,
    fatherName,
    motherName,
    courseName,
    semester,
    subCode,
    totalMarks,
    isPractical,
    sgpa,
    cgpa,
}) {
    // Validate required fields
    const requiredFields = {
        regNo,
        studentName,
        fatherName,
        motherName,
        courseName,
        semester,
        subCode,
        totalMarks,
        sgpa,
        cgpa,
    };
    const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => value === undefined || value === null || value === "")
        .map(([key]) => key);

    if (missingFields.length > 0) {
        const error = new Error(`Missing required fields: ${missingFields.join(", ")}`);
        logger.error("Validation failed for uploadStudentData", { missingFields, regNo });
        throw error;
    }

    if (isPractical === undefined || isPractical === null) {
        const error = new Error("isPractical field is required");
        logger.error("Validation failed: isPractical missing", { regNo, subCode });
        throw error;
    }

    try {
        const studentRef = collection(db, "students");

        const docData = {
            "Registration Number": parseInt(regNo, 10),
            Name: String(studentName).trim(),
            "Father's Name": String(fatherName).trim(),
            "Mother's Name": String(motherName).trim(),
            "Course Name": String(courseName).trim(),
            Semester: parseInt(semester, 10),
            "Subject Code": String(subCode).trim(),
            "Total Marks": parseInt(totalMarks, 10),
            isPractical: Boolean(isPractical),
            SGPA: parseFloat(sgpa),
            "Curr. GPA": parseFloat(cgpa),
            // Metadata for tracking
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(studentRef, docData);

        logger.debug("Student data uploaded successfully", {
            docId: docRef.id,
            regNo,
            semester,
            subCode,
        });

        return docRef.id;
    } catch (error) {
        logger.error("Error uploading student data", {
            error,
            regNo,
            semester,
            subCode,
        });
        throw error;
    }
}

/**
 * Batch upload multiple student records.
 * More efficient for bulk operations.
 *
 * @param {Array} records - Array of student data objects
 * @returns {Promise<Object>} Upload results
 */
export async function uploadStudentDataBatch(records) {
    const results = {
        successful: [],
        failed: [],
    };

    // Process in chunks to avoid overwhelming Firebase
    const chunkSize = 500;
    const chunks = [];

    for (let i = 0; i < records.length; i += chunkSize) {
        chunks.push(records.slice(i, i + chunkSize));
    }

    for (const chunk of chunks) {
        const promises = chunk.map(async (record, index) => {
            try {
                const docId = await uploadStudentData(record);
                results.successful.push({ index, docId, regNo: record.regNo });
            } catch (error) {
                results.failed.push({ index, error: error.message, regNo: record.regNo });
            }
        });

        await Promise.all(promises);
    }

    logger.info("Batch upload completed", {
        total: records.length,
        successful: results.successful.length,
        failed: results.failed.length,
    });

    return results;
}
