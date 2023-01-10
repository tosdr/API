const natural = require('natural');
const sdk = require('node-appwrite');

let classifier = new natural.BayesClassifier();


async function init(){

await classifier.addDocument("Visit my awesome website https://isellshit.com!", "spam");


let appwriteClient = new sdk.Client()
.setEndpoint(process.env.APPWRITE_HOSTNAME)
.setProject(process.env.APPWRITE_PROJECT_KEY)
.setKey(process.env.APPWRITE_API_KEY);

let storage = new sdk.Storage(appwriteClient);

let data = JSON.stringify(classifier);

console.log(data);

await storage.createFile(process.env.APPWRITE_BUCKET_ID, "bayes_spam_classifier", sdk.InputFile.fromPlainText(data, "bayes_spam_classifier.json"))



}

init();