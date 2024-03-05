import imageType from "image-type";

export async function toBase64Format(inputImage) {
  const { ext: fileExt } = await imageType(inputImage);
  return `data:image/${fileExt};base64,` + inputImage.toString("base64");
}
