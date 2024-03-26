import { mkConfig, generateCsv, asString } from "export-to-csv";
import { writeFileSync } from "fs";

/**
 * Generates a CSV file from the given data array and returns the CSV buffer.
 *
 * @param {Array} dataArray - The array of data objects to generate the CSV from.
 * @return {Buffer} The CSV buffer containing the generated CSV file.
 */
export function generateCSV(dataArray) {
  const csvConfig = mkConfig({
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
    ],
  });
  const csvStream = generateCsv(csvConfig)(dataArray);
  const csvBuffer = Buffer.from(asString(csvStream));
  writeFileSync("out.csv", csvBuffer);
  return csvBuffer;
}

import { generateMockData } from "./mockDataGen.js";
generateCSV(generateMockData(50));
