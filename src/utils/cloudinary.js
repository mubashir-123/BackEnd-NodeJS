import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadonCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    //  upload file successfully
    // console.log("File is uploaded on cloudinary", response.url);
    fs.unlinkSync(localFilePath)  //remove the locally save temporary file as the upload operation failed

    return {url: response.url, public_id: response.public_id,};
  } catch (error) {
    // Normalize the file path
    fs.unlinkSync(localFilePath); //remove the locally save temporary file as the upload operation failed
    return null;
  }
};

export { uploadonCloudinary };
