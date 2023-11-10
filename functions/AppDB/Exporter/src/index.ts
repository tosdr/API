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

import { Client } from 'pg';
import { RESTfulAPI } from './helpers/RESTfulAPI';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import * as fs from 'fs';
import JSZip from 'jszip';



type Context = {
  req: any;
  res: any;
  log: (msg: any) => void;
  error: (msg: any) => void;
};

export default async ({ req, res, log, error }: Context) => {

  const client = new Client()
  await client.connect();

  const tarballStream = fs.createWriteStream("/tmp/export.zip");

  let services = (await client.query('SELECT id, name, rating, url FROM services WHERE is_comprehensively_reviewed = true')).rows;

  const s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? "eu-west"
  });
  const zip = new JSZip();

  zip.folder("tosdr");
  zip.file("tosdr/db.json", JSON.stringify(services));

  zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(fs.createWriteStream('/tmp/export.zip'))
    .on('finish', async function () {


      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: crypto.createHash('sha512').update(JSON.stringify(services)).digest('hex') + ".zip",
          Body: fs.readFileSync("/tmp/export.zip")
        })
      );

      fs.unlinkSync("/tmp/export.zip");



      await client.end();


      return res.json(RESTfulAPI.response(256, "OK"));
    });

    return res.empty();


};
