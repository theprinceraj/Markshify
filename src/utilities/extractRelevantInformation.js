class Student {
  constructor(
    registrationNumber,
    studentName,
    fatherName,
    motherName,
    courseName,
    SEMESTERS,
    currentSemester,
    currentCGPA
  ) {
    this.registrationNumber = registrationNumber;
    this.studentName = studentName;
    this.fatherName = fatherName;
    this.motherName = motherName;
    this.courseName = courseName;
    this.SEMESTERS = SEMESTERS;
    this.currentSemester = currentSemester;
    this.currentCGPA = currentCGPA;
  }

  displayInfo() {
    console.log(this);
  }
}

export function extractRelevantInformation(ocrLines) {
  console.log(ocrLines[4].text);
}
