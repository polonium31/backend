import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadOnCloud = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File is uploaded on cloudinary", (await response).url);
    return response.url;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};
export { uploadOnCloud };
