export function extractRelevantInformation(ocrLines) {
  let currentSemester = convertRomanNumeralToInteger(
    ocrLines[4].LineText?.split(":")[1].trim()
  );
  let registrationNo = parseInt(ocrLines[26].LineText.trim());
  let student = ocrLines[27].LineText.trim();
  let father = ocrLines[28].LineText.trim();
  let mother = ocrLines[32].LineText.trim();
  let course = ocrLines[34].LineText.trim();
  let theoryMarksSem1_011201 = parseInt(ocrLines[76].LineText.trim());
  let theoryMarksSem1_011202 = parseInt(ocrLines[77].LineText.trim());
  let theoryMarksSem1_021201 = parseInt(ocrLines[78].LineText.trim());
  let theoryMarksSem1_211202 = parseInt(ocrLines[79].LineText.trim());
  let theoryMarksSem1_231201 = parseInt(ocrLines[80].LineText.trim());
  let practicalMarksSem1_011201 = parseInt(ocrLines[82].LineText.trim());
  let practicalMarksSem1_011202 = parseInt(ocrLines[83].LineText.trim());
  let practicalMarksSem1_021201 = parseInt(ocrLines[84].LineText.trim());
  let practicalMarksSem1_021203 = parseInt(ocrLines[85].LineText.trim());
  let practicalMarksSem1_231201 = parseInt(ocrLines[86].LineText.trim());
  return formatOutput(
    registrationNo,
    student,
    father,
    mother,
    currentSemester,
    course,
    theoryMarksSem1_011201,
    theoryMarksSem1_011202,
    theoryMarksSem1_021201,
    theoryMarksSem1_211202,
    theoryMarksSem1_231201,
    practicalMarksSem1_011201,
    practicalMarksSem1_011202,
    practicalMarksSem1_021201,
    practicalMarksSem1_021203,
    practicalMarksSem1_231201
  );
}

function formatOutput(
  registrationNo,
  student,
  father,
  mother,
  currentSemester,
  course,
  theoryMarksSem1_011201,
  theoryMarksSem1_011202,
  theoryMarksSem1_021201,
  theoryMarksSem1_211202,
  theoryMarksSem1_231201,
  practicalMarksSem1_011201,
  practicalMarksSem1_011202,
  practicalMarksSem1_021201,
  practicalMarksSem1_021203,
  practicalMarksSem1_231201
) {
  const formattedString =
    "Registration Number,Name,Father,Mother,Course,Semester,Sem 1 Theory Marks,Sem 1 Practical Marks\n" +
    `${registrationNo}, ` +
    `${student}, ` +
    `${father}, ` +
    `${mother}, ` +
    `${currentSemester}, ` +
    `${course}, ` +
    `"` +
    `011201 - ${theoryMarksSem1_011201}, ` +
    `011201 - ${theoryMarksSem1_011202}, ` +
    `021201 - ${theoryMarksSem1_021201}, ` +
    `211202 - ${theoryMarksSem1_211202}, ` +
    `231201 - ${theoryMarksSem1_231201}` +
    `",` +
    `"` +
    `011201L - ${practicalMarksSem1_011201}, ` +
    `011201L - ${practicalMarksSem1_011202}, ` +
    `021201L - ${practicalMarksSem1_021201}, ` +
    `021203L - ${practicalMarksSem1_021203}, ` +
    `231201L - ${practicalMarksSem1_231201}` +
    `"`;
  return formattedString;
}

function convertRomanNumeralToInteger(semesterInRoman) {
  switch (semesterInRoman) {
    case "I":
      return 1;
    case "II":
      return 2;
    case "III":
      return 3;
    case "IV":
      return 4;
    case "V":
      return 5;
    case "VI":
      return 6;
    case "VII":
      return 7;
    case "VIII":
      return 8;
    case "IX":
      return 9;
    case "X":
      return 10;
  }
}
