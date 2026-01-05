import { db } from "./firebaseInitialize.js";
import { collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import logger from "../logger.js";

/**
 * Fetches all student records from Firebase.
 * Includes error handling and logging.
 * @returns {Promise<Array>} Array of student records
 */
export async function fetchStudentsArr() {
    try {
        const studentRef = collection(db, "students");
        const studentSnapshot = await getDocs(studentRef);

        const students = studentSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        logger.info("Fetched student records", { count: students.length });
        return students;
    } catch (error) {
        logger.error("Error fetching student records", { error });
        throw error;
    }
}

/**
 * Fetches student records with pagination.
 * Useful for large datasets.
 * @param {Object} options - Pagination options
 * @param {number} options.pageSize - Number of records per page
 * @param {DocumentSnapshot} options.lastDoc - Last document from previous page
 * @returns {Promise<Object>} Paginated results
 */
export async function fetchStudentsPaginated({ pageSize = 100, lastDoc = null } = {}) {
    try {
        const studentRef = collection(db, "students");

        let q = query(studentRef, orderBy("Registration Number"), limit(pageSize));

        if (lastDoc) {
            q = query(studentRef, orderBy("Registration Number"), startAfter(lastDoc), limit(pageSize));
        }

        const snapshot = await getDocs(q);
        const students = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        const lastVisible = snapshot.docs[snapshot.docs.length - 1];

        logger.debug("Fetched paginated student records", {
            count: students.length,
            hasMore: students.length === pageSize,
        });

        return {
            students,
            lastDoc: lastVisible,
            hasMore: students.length === pageSize,
        };
    } catch (error) {
        logger.error("Error fetching paginated records", { error });
        throw error;
    }
}
