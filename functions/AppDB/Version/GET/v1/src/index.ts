/*
  'req' variable has:
    'headers' - object with request headers
    'payload' - request body data as a string
    'variables' - object with function variables

  'res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200

  If an error is thrown, a response with code 500 will be returned.
*/

import { Bitmask } from "api-microservices";
import { RESTfulAPI } from './helpers/RESTfulAPI';
import { ListObjectsCommand, S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";





type Context = {
  req: any;
  res: any;
  log: (msg: any) => void;
  error: (msg: any) => void;
};

export default async ({ req, res, log, error }: Context) => {


  const s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? "eu-west"
  });


  const objects = await s3.send(
    new ListObjectsCommand({
      Bucket: process.env.S3_BUCKET,
    })
  );

  objects.Contents.sort(function (a, b) {
    return (b.LastModified > a.LastModified) ? 1 :
      ((a.LastModified > b.LastModified) ? -1 : 0);
  });

  let latestFile;

  for (let file of objects.Contents) {
    if (file.Key.endsWith('zip')) {
      latestFile = file;
      break;
    }
  }

  if (!latestFile) {
    return res.json(RESTfulAPI.response(Bitmask.GENERIC_ERROR, "No exports found"));
  }

  const command = new GetObjectCommand(
    {
      Bucket: process.env.S3_BUCKET,
      Key: latestFile.Key
    }
  );
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });



  return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "OK", {
    "version": latestFile.Key.replace(".zip", ""),
    "signed_url": url,
    "last_modified": latestFile.LastModified.toISOString(),
  }));


};