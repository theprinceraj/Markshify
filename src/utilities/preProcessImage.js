import sharp from "sharp";

export async function preProcessImage(base64Image) {
  const imageBuffer = Buffer.from(
    base64Image.split(";base64,").pop(),
    "base64"
  );
  const response = await sharp(imageBuffer)
    .extract({ width: 2113, height: 1807, top: 805, left: 181 })
    .greyscale()
    .toBuffer({ resolveWithObject: false });

  return response;
}
