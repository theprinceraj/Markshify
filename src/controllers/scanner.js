import { convertRomanNumeralToInteger } from "../utilities/extractRelevantInformation.js";
import { createRectangles } from "../utilities/tesseract/createRectangles.js";
import { getJobDone } from "../utilities/tesseract/getJobDone.js";
import { preProcessImage } from "../utilities/sharp/preProcessImage.js";
import { uploadStudentData } from "../utilities/firebase/uploadStudentData.js";

export async function scan(req, res) {
  const base64versionImage = req.body.image;
  if (!base64versionImage)
    return res
      .status(400)
      .json({ error: "Image data is missing in the request body" });

  try {
    const preProcessedImage = await preProcessImage(base64versionImage);
    const currentSemesterNumber = convertRomanNumeralToInteger(
      (await getJobDone(preProcessedImage, createRectangles("semester")))[0]
    );
    const [
      registrationNumber,
      studentName,
      fatherName,
      motherName,
      courseName,
    ] = await getJobDone(preProcessedImage, createRectangles("personal-info"));
    const [sgpa, cgpa] = await getJobDone(
      preProcessedImage,
      createRectangles("gpa")
    );

    let formatted;
    const [
      theory1code,
      theory1marks,
      theory2code,
      theory2marks,
      theory3code,
      theory3marks,
      theory4code,
      theory4marks,
      theory5code,
      theory5marks,
    ] = await getJobDone(preProcessedImage, createRectangles("theory"));
    const [
      practical1code,
      practical1marks,
      practical2code,
      practical2marks,
      practical3code,
      practical3marks,
      practical4code,
      practical4marks,
      practical5code,
      practical5marks,
    ] = await getJobDone(preProcessedImage, createRectangles("practical"));

    formatted = `${registrationNumber} | ${studentName} |${fatherName} | ${motherName} \n ${currentSemesterNumber} | ${courseName} | ${sgpa} | ${cgpa} \n ${theory1code} | ${theory1marks} | ${theory2code} | ${theory2marks} | ${theory3code} | ${theory3marks} | ${theory4code} | ${theory4marks} | ${theory5code} | ${theory5marks} \n ${practical1code} | ${practical1marks} | ${practical2code} | ${practical2marks} | ${practical3code} | ${practical3marks} | ${practical4code} | ${practical4marks} | ${practical5code} | ${practical5marks} `;
    const theory = [
      {
        code: theory1code,
        marks: theory1marks,
      },
      {
        code: theory2code,
        marks: theory2marks,
      },
      {
        code: theory3code,
        marks: theory3marks,
      },
      {
        code: theory4code,
        marks: theory4marks,
      },
      {
        code: theory5code,
        marks: theory5marks,
      },
    ];

    const practical = [
      {
        code: practical1code,
        marks: practical1marks,
      },
      {
        code: practical2code,
        marks: practical2marks,
      },
      {
        code: practical3code,
        marks: practical3marks,
      },
      {
        code: practical4code,
        marks: practical4marks,
      },
      {
        code: practical5code,
        marks: practical5marks,
      },
    ];

    theory.forEach(({ code, marks }) => {
      if (code && marks) {
        uploadStudentData({
          regNo: registrationNumber,
          studentName: studentName,
          fatherName: fatherName,
          motherName: motherName,
          courseName: courseName,
          semester: currentSemesterNumber,
          subCode: code,
          totalMarks: marks,
          isPractical: false,
          sgpa: sgpa,
          cgpa: cgpa,
        });
      }
    });
    practical.forEach(({ code, marks }) => {
      if (code && marks) {
        uploadStudentData({
          regNo: registrationNumber,
          studentName: studentName,
          fatherName: fatherName,
          motherName: motherName,
          courseName: courseName,
          semester: currentSemesterNumber,
          subCode: code,
          totalMarks: marks,
          isPractical: true,
          sgpa: sgpa,
          cgpa: cgpa,
        });
      }
    });

    res.json({
      ocrResponse: [registrationNumber, currentSemesterNumber],
      formattedString: formatted,
    });
  } catch (error) {
    console.error("Error processing OCR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
