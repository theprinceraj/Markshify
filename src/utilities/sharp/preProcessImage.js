import sharp from "sharp";
import fs from "fs";

export async function preProcessImage(base64Image) {
  const imageBuffer = Buffer.from(
    base64Image.split(";base64,").pop(),
    "base64"
  );
  let response = await sharp(imageBuffer)
    .greyscale()
    .extract({ width: 2113, height: 1807, top: 805, left: 181 })
    .png()
    .toBuffer({ resolveWithObject: false });
  const preProcessedImage = await addBorder(response, 5, {
    r: 0,
    g: 0,
    b: 0,
    alpha: 1,
  });
  fs.writeFileSync("processedImage.png", preProcessedImage);
  return preProcessedImage;
}

async function addBorder(buffer, borderSize, borderColor) {
  try {
    const img = sharp(buffer);
    const metadata = await img.metadata();

    const newWidth = metadata.width + borderSize * 2;
    const newHeight = metadata.height + borderSize * 2;
    const newImg = await sharp({
      density: 72,
      create: {
        width: newWidth,
        height: newHeight,
        channels: 4,
        background: borderColor,
      },
    }).png();

    const result = await newImg
      .composite([
        {
          input: buffer,
          top: borderSize,
          left: borderSize,
        },
      ])
      .png()
      .withMetadata({ density: 72 })
      .toBuffer();

    fs.writeFileSync('processedImage.png', result)
    return result;
  } catch (err) {
    console.error(
      "Error occurred in the addBorder function. Error: \n" + err + "\n"
    );
  }
}