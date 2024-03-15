import sharp from "sharp";
import fs from "fs";
let imageFile = fs.readFileSync("src/utilities/dp1.jpg")

async function preProcessImage(InputImage) {
    // Write code below this line
try {
    //Extracting parameters 
    const left = 421;
    const top = 13;
    const width = 646;
    const height = 13;

    // Extracting the region from the input image
    await sharp(inputImage)
        .extract({ left: left, top: top, width: width, height: height})
        .toFile("outputImage.jpg");

        console.log('Image extraction completed succesfully...koi bhi dikatt nahi hai.');
    }catch (error) {
        console.error('Error processing the image:', error);
        throw error;ṇ
    }

    // Write code above this line
}
preProcessImage(imageFile)