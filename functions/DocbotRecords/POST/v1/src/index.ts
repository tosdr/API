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
import { Phoenix } from './helpers/Phoenix';
import {Bitmask, RESTfulAPI} from "api-microservices";

module.exports = async function (req: any, res: any) {
  const client = new Client()
  await client.connect();

  // The request will already be parsed if handled by server.js
  let request = typeof req.payload === 'string' ? JSON.parse(req.payload) : req.payload;

  if (!request.case_id) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'case_id'"), 400);
  }

  if (!request.document_id) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'document_id'"), 400);
  }

  if (!request.docbot_version) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'docbot_version'"), 400);
  }

  if (!request.text_version) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'text_version'"), 400);
  }

  // char_start and char_end are technically optional

  await Phoenix.createDocbotRecord(
      request.case_id, request.document_id, request.docbot_version, request.text_version, request.char_start,
      request.char_end, request.ml_score, client
  );
  await client.end();
  res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "DocbotRecord created"), 201)
};
