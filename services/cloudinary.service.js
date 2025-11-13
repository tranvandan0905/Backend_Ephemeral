const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});
const uploadToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
       {
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    uploadStream.end(fileBuffer); 
  });
};

const deleteFromCloudinary = async (imageUrl) => {
    try {
        const publicId = imageUrl.split('/').pop().split('.')[0]; 
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error("Lỗi khi xóa ảnh trên Cloudinary: " + error.message);
    }
};
module.exports = { uploadToCloudinary, deleteFromCloudinary };
