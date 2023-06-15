import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import dotenv from "dotenv";

dotenv.config();

const bucketName = "rassrochka";
const region = "eu-north-1";
// const accessKeyId = "AKIAZHDDHTPP5RT66HVP";
// const secretAccessKey = "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";
const accessKeyId = "AKIAZHDDHTPP57FFDG7N";
const secretAccessKey = "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";

const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

export function uploadFile(fileBuffer: any, fileName: any, mimetype: any) {
    const uploadParams = {
        Bucket: bucketName,
        Body: fileBuffer,
        Key: fileName,
        ContentType: mimetype,
    };

    return s3Client.send(new PutObjectCommand(uploadParams));
}

export function deleteFile(fileName: any) {
    const deleteParams = {
        Bucket: bucketName,
        Key: fileName,
    };

    return s3Client.send(new DeleteObjectCommand(deleteParams));
}

export async function getObjectSignedUrl(key: any) {
    const params = {
        Bucket: bucketName,
        Key: key,
    };
    const command = new GetObjectCommand(params);
    const seconds = 60;
    const url = await getSignedUrl(s3Client, command, { expiresIn: seconds });

    return url;
}
