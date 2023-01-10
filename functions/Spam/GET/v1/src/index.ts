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

  let classifier = natural.BayesClassifier.restore(await Spam.loadClassifier());

  let request = JSON.parse(req.payload);

  if (!request.text) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'text'"), 400);
  }

  let isSpam = classifier.classify(request.text) === "spam";


  return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "OK", {
    "isSpam": isSpam,
    "text": request.text
    }
  ));




};
