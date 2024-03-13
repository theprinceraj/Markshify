export function extractRelevantInformation(ocrLines) {
  let currentSemester = convertRomanNumeralToInteger(
    ocrLines[4].LineText?.split(":")[1].trim()
  );
  let registrationNo = parseInt(ocrLines[26].LineText.trim());
  let student = ocrLines[27].LineText.trim();
  let father = ocrLines[28].LineText.trim();
  let mother = ocrLines[32].LineText.trim();
  let course = ocrLines[34].LineText.trim();
  ocrLines.splice(0, 76);
  let theoryMarksSem1_011201 = parseInt(ocrLines[0].LineText.trim());
  let theoryMarksSem1_011202 = parseInt(ocrLines[1].LineText.trim());
  let theoryMarksSem1_021201 = parseInt(ocrLines[2].LineText.trim());
  let theoryMarksSem1_211202 = parseInt(ocrLines[3].LineText.trim());
  let theoryMarksSem1_231201 = parseInt(ocrLines[4].LineText.trim());
  let practicalMarksSem1_011201 = parseInt(ocrLines[6].LineText.trim());
  let practicalMarksSem1_011202 = parseInt(ocrLines[7].LineText.trim());
  let practicalMarksSem1_021201 = parseInt(ocrLines[8].LineText.trim());
  let practicalMarksSem1_021203 = parseInt(ocrLines[9].LineText.trim());
  let practicalMarksSem1_231201 = parseInt(ocrLines[10].LineText.trim());
    
  // console.log(ocrLines);
  // let semGPAs = new Array(8).fill(NaN);
  // semGPAs[0] = parseFloat(ocrLines[103].LineText.trim());
  // semGPAs[1] = parseFloat(ocrLines[105].LineText.trim()) || NaN;
  // semGPAs[2] = parseFloat(ocrLines[107].LineText.trim()) || NaN;
  // semGPAs[3] = parseFloat(ocrLines[110].LineText.trim()) || NaN;
  // semGPAs[4] = parseFloat(ocrLines[112].LineText.trim()) || NaN;
  // semGPAs[5] = parseFloat(ocrLines[114].LineText.trim()) || NaN;
  // semGPAs[6] = parseFloat(ocrLines[116].LineText.trim()) || NaN;
  // semGPAs[7] = parseFloat(ocrLines[118].LineText.trim()) || NaN;
  // console.log(semGPAs);
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
    `011202 - ${theoryMarksSem1_011202}, ` +
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
