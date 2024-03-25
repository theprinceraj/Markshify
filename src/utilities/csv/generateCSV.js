import { mkConfig, generateCsv, asString } from "export-to-csv";
import { writeFileSync } from "fs";

(() => {
  const csvConfig = mkConfig({
    columnHeaders: [
      "Registration Number",
      "Name",
      "Father's Name",
      "Course Name",
      "Semester",
      "SGPA",
      "CGPA",
      "Subject Code",
      "Total Marks",
    ],
  });
  const csvYo = generateCsv(csvConfig)([
    {
      name: "prince Raj",
      class: 12,
      marks: 90,
    },
    {
      name: "Ragav",
      class: 8,
    },
    {
      name: "lol",
      class: 9,
      marks: 95,
    },
  ]);
  writeFileSync("out.csv", Buffer.from(asString(csvYo)));
})();
