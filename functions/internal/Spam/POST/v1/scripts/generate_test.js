const natural = require('natural');
const sdk = require('node-appwrite');

let classifier = new natural.BayesClassifier();


async function init(){

await classifier.addDocument("When anyone uses your material without your permission or credit, you can file a complaint with Google. You should report the perpetrator to Google and get them removed from Google search results because you own the content. British Dissertations Help", "spam");
await classifier.addDocument("You can report copyright infringement to Google. Go to the Google DMCA page to report the infringement. You would need to select the category: 'web search'. Then choose the appropriate options in your case. Then you should decide on the Google Product, give the reason for submitting the DMCA Notice and confirm that you are the owner of the copyright. <a href=\"https://essaysnassignments.co.uk/dissertation-writing-services/\">Dissertation Writing Services UK</a>".replace(/<\/?[^>]+(>|$)/g, ""), "spam");


await classifier.train();

let appwriteClient = new sdk.Client()
.setEndpoint(process.env.APPWRITE_HOSTNAME)
.setProject(process.env.APPWRITE_PROJECT_KEY)
.setKey(process.env.APPWRITE_API_KEY);

let storage = new sdk.Storage(appwriteClient);

let data = JSON.stringify(classifier);

console.log(data);

await storage.deleteFile(process.env.APPWRITE_BUCKET_ID, "bayes_spam_classifier");

await storage.createFile(process.env.APPWRITE_BUCKET_ID, "bayes_spam_classifier", sdk.InputFile.fromPlainText(data, "bayes_spam_classifier.json"))



}

init();