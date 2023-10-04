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
import {Bitmask, Points, RESTfulAPI} from "api-microservices";

module.exports = async function (req: any, res: any) {
  // TODO verify request

  const client = new Client()
  await client.connect();

  let request = JSON.parse(req.payload);

  if (!request.case_id) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'case_id'"), 400);
  }

  if (!request.user_id) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'user_id'"), 400);
  }

  if (!request.document_id) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'document_id'"), 400);
  }

  if (!request.service_id) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'service_id'"), 400);
  }

  if (!request.docbot_version) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'docbot_version'"), 400);
  }

  if (!request.source) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'source'"), 400);
  }

  const caseObj = await Phoenix.getCase(request.case_id, client);
  const caseId = caseObj?.id;
  const title = caseObj?.title;
  const topicId = caseObj?.topic_id;

  const result = await Phoenix.createPoint(
      caseId, request.user_id, request.document_id, topicId, request.service_id, 'pending', title,
      request.docbot_version, request.source, client
  );

  // return ? not sure
};
