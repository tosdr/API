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

import { Bitmask } from '@tosdr/api-microservices';
import { Spam } from './helpers/Spam';
import { RESTfulAPI } from './helpers/RESTfulAPI';

import * as natural from 'natural';



module.exports = async function (req: any, res: any) {


  let request = JSON.parse(req.payload);

  if (!request.text) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'text'"), 400);
  }

  if (!request.type) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'type'"), 400);
  }

  console.log("request", request);

  if (request.type !== "ham" && request.type !== "spam") {
    return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "Invalid Parameter 'type' is not spam or ham"), 400);
  }


  let classifier = natural.BayesClassifier.restore(JSON.parse(await Spam.loadClassifier()));

  classifier.addDocument(request.text.replace(/<\/?[^>]+(>|$)/g, ""), request.type);

  classifier.train();


  let data = JSON.stringify(classifier);

  let saved = Spam.saveClassifier(data);

  return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "OK", {
    "trained": saved, 
    "type": request.type,
    "text": request.text
    }
  ));




};
