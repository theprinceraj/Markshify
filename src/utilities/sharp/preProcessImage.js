import sharp from "sharp";
export async function preProcessImage(base64Image) {
  const imageBuffer = Buffer.from(
    base64Image.split(";base64,").pop(),
    "base64"
  );
  let sharpInstance = sharp(imageBuffer);
  const metadata = await sharpInstance.metadata();
  if (metadata.width < 2480 || metadata.height < 3505) {
    throw new Error(
      "Image dimensions are insufficient for extraction. Please provide an image with a width of at least 2480 and a height of at least 3505."
    );
  }
  let response = await sharpInstance
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
  return preProcessedImage;
}

async function addBorder(buffer, borderSize, borderColor) {
  try {
    const img = sharp(buffer);
    const metadata = await img.metadata();

    const newWidth = metadata.width + borderSize * 2;
    const newHeight = metadata.height + borderSize * 2;
    const newImg = sharp({
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

    return result;
  } catch (err) {
    console.error(
      "Error occurred in the addBorder function:" + err + "\n"
    );
  }
}
