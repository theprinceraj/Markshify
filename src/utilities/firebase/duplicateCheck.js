import { db } from "./firebaseInitialize.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import logger from "../logger.js";

/**
 * Checks if a student record already exists in the database.
 * Prevents duplicate entries when rescanning the same document.
 *
 * @param {Object} params - Record parameters to check
 * @param {string} params.regNo - Registration number
 * @param {number} params.semester - Semester number
 * @param {string} params.subCode - Subject code
 * @returns {Promise<Object|null>} Existing record if found, null otherwise
 */
export async function checkDuplicate({ regNo, semester, subCode }) {
    try {
        const studentRef = collection(db, "students");
        const q = query(
            studentRef,
            where("Registration Number", "==", parseInt(regNo)),
            where("Semester", "==", parseInt(semester)),
            where("Subject Code", "==", subCode)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const existingDoc = snapshot.docs[0];
            logger.debug("Duplicate record found", {
                regNo,
                semester,
                subCode,
                docId: existingDoc.id,
            });

            return {
                id: existingDoc.id,
                data: existingDoc.data(),
            };
        }

        return null;
    } catch (error) {
        logger.error("Error checking for duplicate", {
            error,
            regNo,
            semester,
            subCode,
        });
        return null;
    }
}

/**
 * Checks for duplicates in batch.
 * More efficient than individual checks for batch processing.
 *
 * @param {Array} records - Array of record objects to check
 * @returns {Promise<Map>} Map of record keys to existing documents
 */
export async function checkDuplicatesBatch(records) {
    const duplicates = new Map();

    try {
        // Group records by registration number for efficient querying
        const regNumbers = [...new Set(records.map((r) => parseInt(r.regNo)))];

        for (const regNo of regNumbers) {
            const studentRef = collection(db, "students");
            const q = query(studentRef, where("Registration Number", "==", regNo));

            const snapshot = await getDocs(q);

            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                const key = `${data["Registration Number"]}-${data.Semester}-${data["Subject Code"]}`;
                duplicates.set(key, {
                    id: doc.id,
                    data,
                });
            });
        }

        logger.debug("Batch duplicate check completed", {
            recordsChecked: records.length,
            duplicatesFound: duplicates.size,
        });

        return duplicates;
    } catch (error) {
        logger.error("Error in batch duplicate check", { error });
        return duplicates;
    }
}

/**
 * Generates a unique key for a student record.
 * @param {Object} record - Student record
 * @returns {string} Unique key
 */
export function generateRecordKey(record) {
    return `${record.regNo}-${record.semester}-${record.subCode}`;
}
