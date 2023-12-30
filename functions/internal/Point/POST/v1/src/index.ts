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

  if (!req.body || !('case_id' in req.body)) {
    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'case_id'"), 400);
  }

  if (!('user_id' in req.body)) {
    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'user_id'"), 400);
  }

  if (!('document_id' in req.body)) {
    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'document_id'"), 400);
  }

  if (!('service_id' in req.body)) {
    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'service_id'"), 400);
  }

  // It seems standard to give the doc source URL
  if (!('source' in req.body)) {
    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'source'"), 400);
  }

  // For now this API only exists for docbot, so ensure docbot-specific fields are passed
  if (!('docbot_version' in req.body)) {
    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'docbot_version'"), 400);
  }
  if (!('ml_score' in req.body)) {
    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'ml_score'"), 400);
  }

  const caseObj = await Phoenix.getCase(req.body.case_id, client);
  const caseId = parseInt(caseObj?.id);
  const title = caseObj?.title;

  const result = await Phoenix.createPoint(
      caseId, req.body.user_id, req.body.document_id, req.body.service_id, 'pending', title,
      req.body.source, req.body.analysis, req.body.quote_text, req.body.quote_start, req.body.quote_end,
      req.body.docbot_version, req.body.ml_score, client
  );

  await client.end();
  return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "Point created"), 201)
};
