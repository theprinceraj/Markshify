import { mkConfig, generateCsv, asString } from "export-to-csv";
import { writeFileSync } from "fs";

function generateCSV(dataArray) {
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
  const csvYo = generateCsv(csvConfig)(dataArray);
  const csvBuffer = Buffer.from(asString(csvYo));
  writeFileSync("out.csv", csvBuffer);
  return csvBuffer;
}