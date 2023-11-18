import { Client, Storage, InputFile } from 'node-appwrite';
import * as Minio from 'minio';
import * as fs from 'fs';


export class Spam {

  
  static async loadClassifier(): Promise<string> {


    var minioClient = new Minio.Client({
      endPoint: process.env.S3_HOST,
      port: 443,
      useSSL: true,
      accessKey: process.env.S3_ACCESS,
      secretKey: process.env.S3_SECRET
    });

     await minioClient.fGetObject(process.env.S3_BUCKET, "bayes_spam_classifier.json", "/tmp/bayes_spam_classifier.json");

     let data = fs.readFileSync("/tmp/bayes_spam_classifier.json").toString();

     fs.unlinkSync("/tmp/bayes_spam_classifier.json");

     return data;
  }


  static async saveClassifier(data: string): Promise<boolean> {


    var minioClient = new Minio.Client({
      endPoint: process.env.S3_HOST,
      port: 443,
      useSSL: true,
      accessKey: process.env.S3_ACCESS,
      secretKey: process.env.S3_SECRET
    });

     fs.writeFileSync("/tmp/bayes_spam_classifier.json", data);

     await minioClient.fPutObject(process.env.S3_BUCKET, "bayes_spam_classifier.json", "/tmp/bayes_spam_classifier.json");

     fs.unlinkSync("/tmp/bayes_spam_classifier.json");

     return true;
  }

}