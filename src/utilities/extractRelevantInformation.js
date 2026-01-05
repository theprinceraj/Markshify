/**
 * Roman numeral to integer mapping.
 */
const ROMAN_NUMERALS = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
    IX: 9,
    X: 10,
    XI: 11,
    XII: 12,
};

/**
 * Converts a Roman numeral to an integer equivalent.
 * Handles variations in formatting and whitespace.
 *
 * @param {string} semesterInRoman - The Roman numeral representing a semester.
 * @returns {number|null} The integer equivalent, or null if invalid.
 */
export function convertRomanNumeralToInteger(semesterInRoman) {
    if (!semesterInRoman || typeof semesterInRoman !== "string") {
        return null;
    }

    // Clean and normalize input
    const normalized = semesterInRoman.trim().toUpperCase();

    // Try direct lookup first
    if (ROMAN_NUMERALS[normalized] !== undefined) {
        return ROMAN_NUMERALS[normalized];
    }

    // Try to extract Roman numeral from string (e.g., "Semester III")
    for (const [numeral, value] of Object.entries(ROMAN_NUMERALS).sort((a, b) => b[0].length - a[0].length)) {
        if (normalized.includes(numeral)) {
            return value;
        }
    }

    return null;
}

/**
 * Parses a GPA string to a float value.
 * Handles various formats like "8.5", "8,5", "8.50".
 *
 * @param {string} gpaString - GPA value as string
 * @returns {number|null} Parsed GPA or null if invalid
 */
export function parseGPA(gpaString) {
    if (!gpaString || typeof gpaString !== "string") {
        return null;
    }

    // Replace comma with dot for localization
    const normalized = gpaString.trim().replace(",", ".");
    const parsed = parseFloat(normalized);

    // Validate GPA range (typically 0-10)
    if (isNaN(parsed) || parsed < 0 || parsed > 10) {
        return null;
    }

    return Math.round(parsed * 100) / 100; // Round to 2 decimal places
}

/**
 * Cleans and normalizes extracted text.
 * Removes common OCR artifacts and normalizes whitespace.
 *
 * @param {string} text - Raw OCR text
 * @returns {string} Cleaned text
 */
export function cleanOCRText(text) {
    if (!text || typeof text !== "string") {
        return "";
    }

    return text
        .replace(/[\r\n]+/g, " ") // Replace newlines with spaces
        .replace(/\s+/g, " ") // Collapse multiple spaces
        .replace(/[^\w\s.-]/g, "") // Remove special characters except dash and dot
        .trim();
}

/**
 * Validates a registration number format.
 *
 * @param {string} regNo - Registration number
 * @returns {boolean} Whether the format is valid
 */
export function isValidRegistrationNumber(regNo) {
    if (!regNo || typeof regNo !== "string") {
        return false;
    }

    // Registration numbers typically contain only digits and are 8-15 chars
    const normalized = regNo.trim();
    return /^\d{8,15}$/.test(normalized);
}

/**
 * Validates extracted marks.
 *
 * @param {string} marks - Marks value
 * @returns {boolean} Whether the marks value is valid
 */
export function isValidMarks(marks) {
    if (!marks || typeof marks !== "string") {
        return false;
    }

    const value = parseInt(marks.trim(), 10);
    return !isNaN(value) && value >= 0 && value <= 100;
}
