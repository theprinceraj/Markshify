export function generateMockData(rowCount) {
  const mockData = [];
  const courses = ["B.Tech.", "B.E."];

  for (let i = 1; i <= rowCount; i++) {
    const registrationNumber = 17102110031 + i;
    const name = `Student${i}`;
    const fatherName = `Father${i}`;
    const motherName = `Mother${i}`;
    const courseName = courses[Math.floor(Math.random() * courses.length)];
    const semester = Math.floor(Math.random() * 8) + 1;
    const sgpa = Math.round(Math.random() * 10 * 10) / 10;
    const currGPA = Math.round(Math.random() * 10 * 10) / 10;
    const subjectCode = `SUB${i}`;
    const totalMarks = Math.floor(Math.random() * 101);

    mockData.push({
      "Registration Number": registrationNumber,
      Name: name,
      "Father's Name": fatherName,
      "Mother's Name": motherName,
      "Course Name": courseName,
      Semester: semester,
      SGPA: sgpa,
      "Curr. GPA": currGPA,
      "Subject Code": subjectCode,
      "Total Marks": totalMarks,
    });
  }

  return mockData;
}
