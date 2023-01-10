import { Client, Storage, InputFile } from 'node-appwrite';


export class Spam {

  
  static async loadClassifier(): Promise<string> {
    let appwriteClient = new Client()
    .setEndpoint(process.env.APPWRITE_HOSTNAME)
    .setProject(process.env.APPWRITE_PROJECT_KEY)
    .setKey(process.env.APPWRITE_API_KEY);


    let storage = new Storage(appwriteClient);
    return (await (storage.getFileDownload(process.env.APPWRITE_BUCKET_ID, "bayes_spam_classifier"))).toString('utf-8'); 
  }


  static async saveClassifier(data: string): Promise<boolean> {
    let appwriteClient = new Client()
    .setEndpoint(process.env.APPWRITE_HOSTNAME)
    .setProject(process.env.APPWRITE_PROJECT_KEY)
    .setKey(process.env.APPWRITE_API_KEY);


    let storage = new Storage(appwriteClient);
    await storage.deleteFile(process.env.APPWRITE_BUCKET_ID, "bayes_spam_classifier");
    return (await (storage.createFile(process.env.APPWRITE_BUCKET_ID, "bayes_spam_classifier", InputFile.fromPlainText(data, "bayes_spam_classifier.json")))).$id !== null; 
  }

}