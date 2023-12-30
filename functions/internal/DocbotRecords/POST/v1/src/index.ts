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

type Context = {
  req: any;
  res: any;
  log: (msg: any) => void;
  error: (msg: any) => void;
};

export default async ({ req, res, log, error }: Context) => {
  const client = new Client()
  await client.connect();

  if (!req.query || !('case_id' in req.query)) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'case_id'"), 400);
  }

  if (!('document_id' in req.query)) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'document_id'"), 400);
  }

  if (!('docbot_version' in req.query)) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'docbot_version'"), 400);
  }

  if (!('case_id' in req.query)) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'text_version'"), 400);
  }

  // char_start and char_end are technically optional

  await Phoenix.createDocbotRecord(
      req.query.case_id, req.query.document_id, req.query.docbot_version, req.query.text_version, req.query.char_start,
      req.query.char_end, req.query.ml_score, client
  );
  await client.end();
  res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "DocbotRecord created"), 201)
};
