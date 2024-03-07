class Student {
  constructor(
    registrationNumber,
    studentName,
    fatherName,
    motherName,
    courseName,
    SEMESTER = {
      one,
      two,
      three,
      four,
      five,
      six,
      seven,
      eight,
    },
    currentCGPA
  ) {}

  displayInfo() {
    console.log(this);
  }
}

export async function extractRelevantInformation(ocrString) {
  let StudentObj = new Student();

  let studentNameRegeEx = /Student Name:\s*([\w\s]+)\n/;
  let studentName = ocrString.match(studentNameRegeEx)[1];

  let registrationNumberRegex = /Registration No:\s*(\d+)\n/;
  let registrationNumber = ocrString.match(registrationNumberRegex)[1];
  console.log(studentName, "\n", registrationNumber);
}

const inputString = `
View another Result
fäufäåreru
ARYABHATTA KNOWLEDGE UNIVERSITY, PATNA
B.Tech. 2nd Semester Examination, 2019
Semester : II   Examination(Month/Year) .       • MAY/2019
Registration No:        17102110032
Student Name:   SHASHI BHUSHAN KUMAR
Father Name:    NAGINA RABI DAS MotherName:     MALTI DEVI
College Name:   110 -GAYA COLLEGE OF ENGINEERING, GAYA
Course Name:    102 -MECHANICAL ENGINEERING
THEORY
Subject Code    Subject Name    ESE     IA      Total   Grade   Credit
011201  ENGINEERING MECHANICS   28 A    18      46      3
011202  ENVIRONMENTAL SCIENCE   42      23      65      c       3
021201  ELEMENTS OF MECHANICAL ENGINEERING      51      22      73      3
211202  MATHEMATICS-II  25      19      44      4
231201  ENGINEERING CHEMISTRY   27      24      51      3
PRACTICAL
Subject Code    Subject Name    ESE     IA      Total   Grade   Credit
011201  ENGINEERING MECHANICS   24      13      37      2
011202  ENVIRONMENTAL SCIENCE   25      17      42      2
021201  ELEMENTS OF MECHANICAL ENGINEERING      23      15      38      1
021203  WORKSHOP        58      28      86      4
231201  ENGINEERING CHEMISTRY   23      13      36      2
SGPA: 7.11
Semester:       1       11      111     VII     VIII    Cur. CGPA
SGPA:   7.15    7.11    7.13
Remarks :
NOTE:
** : Marks will be reflected in final mark sheet for carry/Ba cklog papers
ESE : End Semester Exam
IA : Internal Assessment
• AB : Absent
• NA : Not Applicable
. Passed Under Regulation(UR)
CA : Cancellation of Assessment
UMC : UnFair Mean Case
WEB COPY : Not valid for official purpose.
• University does not own for the errors or omissions, if any, in the statement.
`;
extractRelevantInformation(inputString);
