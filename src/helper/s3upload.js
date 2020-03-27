require("dotenv").config();
const aws = require("aws-sdk"); // import aws-sdk
const FileType = require("file-type");

console.log(
  "\nSECRET_ACCESS_KEY ",
  process.env.SECRET_ACCESS_KEY,
  "\nACCESS_KEY_ID ",
  process.env.ACCESS_KEY_ID,
  "\nREGION ",
  process.env.REGION,
  "\nBUCKET_NAME ",
  process.env.BUCKET_NAME,
  "\nBUCKET_KEY_PREFIX ",
  process.env.BUCKET_KEY_PREFIX
);
// Setting aws configurations
aws.config.update({
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  accessKeyId: process.env.ACCESS_KEY_ID,
  region: process.env.REGION || "ap-southeast-1"
});

const bucketName = process.env.BUCKET_NAME;
// Initiating S3 instance
const s3 = new aws.S3({
  apiVersion: "2006-03-01",
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  params: { Bucket: bucketName }
});
// Options you can choose to set to accept files upto certain size limit
const options = { partSize: 10 * 1024 * 1024, queueSize: 1 };
// The heart
// "Key" accepts name of the file, keeping it a timestamp for simplicity
// "Body" accepts the file

async function upload(file, name) {
  console.log(" \n\nfile =====> ", file);
  console.log(" \n\nName =====> ", name);
  try {
    const fileType = await FileType.fromBuffer(file);
    const { ext, mime } = fileType;

    const params = {
      Bucket: bucketName,
      Key: `${process.env.BUCKET_KEY_PREFIX}/${name}.${ext}`,
      Body: file,
      ACL: "public-read",
      ContentType: mime
    };
    console.log(
      " \nFileName ====> ",
      `${process.env.BUCKET_KEY_PREFIX}/${name}.${ext}`
    );
    let fileResp = null;
    await s3
      .upload(params, options)
      .promise()
      .then(res => {
        fileResp = res;
      });
    return fileResp;
  } catch (err) {
    console.warn(" Error ", err);
    return { error: err };
  }
}
module.exports = {
  upload
};
