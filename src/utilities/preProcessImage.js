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
    r: 255,
    g: 0,
    b: 0,
    alpha: 1,
  });
  fs.writeFileSync("processedImage.png", preProcessedImage);
  return preProcessedImage;
}

const file = await fs.readFileSync("./croppedImage.png");
async function addBorder(buffer, borderSize, borderColor) {
  try {
    const img = sharp(buffer);
    const metadata = await img.metadata();
    console.log(metadata.density);

    const newWidth = metadata.width + borderSize * 2;
    const newHeight = metadata.height + borderSize * 2;
    const newImg = await sharp({
      create: {
        width: newWidth,
        height: newHeight,
        channels: 4,
        background: borderColor,
      },
      density: metadata.density,
    }).png();
    const newDensity = (await newImg.metadata()).density;
    console.log(newDensity);
    const result = await newImg
      .composite([
        {
          input: buffer,
          top: borderSize,
          left: borderSize,
        },
      ])
      .png()
      .toBuffer();

    return result;
  } catch (err) {
    console.error(
      "Some error occurred in the addBorder function. Error: \n" + err + "\n"
    );
  }
}
addBorder(file, 10, { r: 255, g: 0, b: 0, alpha: 1 });
