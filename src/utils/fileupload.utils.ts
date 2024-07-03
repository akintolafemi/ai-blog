import * as fs from 'fs-extra';
import { S3 } from "@aws-sdk/client-s3";

export const UploadFileToAWSS3 = async (filePath: string, key: string, dir = '', Metadata?: Record<string, string>): Promise<any> => {
  try {
    const s3 = new S3({    
      region: `${process.env.AWS_DEFAULT_REGION}`,
      forcePathStyle: false,
      credentials: {
        accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
        secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
      },
    });
  
    const fileContent = fs.readFileSync(filePath);
    const uploadPath = `${dir}${key}`

    const upload = await s3.putObject({
      Bucket: `${process.env.AWS_S3_BUCKET_NAME}`,
      Key: uploadPath,
      Body: fileContent,
      ACL: 'public-read',
      Metadata
    })
  
    fs.unlinkSync(filePath);
    const data = {
      ...upload,
      Location: `https://${process.env.AWS_S3_ENDPOINT}/${encodeURI(uploadPath)}`
    }
    return data; 
  } catch (error) {
    console.log(error)
  }
}