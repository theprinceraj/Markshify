import { mkConfig, generateCsv, asString } from "export-to-csv";
import logger from "../logger.js";

/**
 * CSV configuration for student records export.
 */
const CSV_CONFIG = mkConfig({
    columnHeaders: [
        "Registration Number",
        "Name",
        "Father's Name",
        "Mother's Name",
        "Course Name",
        "Semester",
        "SGPA",
        "Curr. GPA",
        "Subject Code",
        "Total Marks",
        "Type",
    ],
    title: "Master Academic Record",
    showTitle: true,
    useKeysAsHeaders: false,
    filename: "academic_records",
});

/**
 * Generates a CSV buffer from the given data array.
 * Includes data validation and formatting.
 *
 * @param {Array} dataArray - The array of student record objects
 * @returns {Buffer} The CSV buffer
 * @throws {Error} If dataArray is invalid
 */
export function generateCSV(dataArray) {
    if (!dataArray) {
        throw new Error("dataArray passed to generateCSV() is undefined");
    }

    if (!Array.isArray(dataArray)) {
        throw new Error("dataArray must be an array");
    }

    if (dataArray.length === 0) {
        logger.warn("Empty dataArray passed to generateCSV");
        // Return CSV with only headers
        return Buffer.from("No records found");
    }

    // Transform and validate data
    const transformedData = dataArray
        .map((record, index) => {
            try {
                return {
                    "Registration Number": record["Registration Number"] || "N/A",
                    Name: record.Name || "N/A",
                    "Father's Name": record["Father's Name"] || "N/A",
                    "Mother's Name": record["Mother's Name"] || "N/A",
                    "Course Name": record["Course Name"] || "N/A",
                    Semester: record.Semester || "N/A",
                    SGPA: typeof record.SGPA === "number" ? record.SGPA.toFixed(2) : record.SGPA || "N/A",
                    "Curr. GPA":
                        typeof record["Curr. GPA"] === "number"
                            ? record["Curr. GPA"].toFixed(2)
                            : record["Curr. GPA"] || "N/A",
                    "Subject Code": record["Subject Code"] || "N/A",
                    "Total Marks": record["Total Marks"] || "N/A",
                    Type: record.isPractical ? "Practical" : "Theory",
                };
            } catch (error) {
                logger.warn("Error transforming record", { index, error: error.message });
                return null;
            }
        })
        .filter(Boolean);

    logger.info("Generating CSV", {
        originalCount: dataArray.length,
        transformedCount: transformedData.length,
    });

    const csvStream = generateCsv(CSV_CONFIG)(transformedData);
    const csvString = asString(csvStream);
    const csvBuffer = Buffer.from(csvString, "utf-8");

    return csvBuffer;
}

/**
 * Generates a summary report of academic records.
 *
 * @param {Array} dataArray - Student records
 * @returns {Object} Summary statistics
 */
export function generateSummaryReport(dataArray) {
    if (!dataArray || dataArray.length === 0) {
        return {
            totalRecords: 0,
            uniqueStudents: 0,
            uniqueCourses: 0,
            avgGPA: 0,
        };
    }

    const uniqueStudents = new Set(dataArray.map((r) => r["Registration Number"]));
    const uniqueCourses = new Set(dataArray.map((r) => r["Course Name"]));

    const gpas = dataArray.map((r) => parseFloat(r["Curr. GPA"])).filter((gpa) => !isNaN(gpa));

    const avgGPA = gpas.length > 0 ? gpas.reduce((a, b) => a + b, 0) / gpas.length : 0;

    return {
        totalRecords: dataArray.length,
        uniqueStudents: uniqueStudents.size,
        uniqueCourses: uniqueCourses.size,
        avgGPA: Math.round(avgGPA * 100) / 100,
    };
}
