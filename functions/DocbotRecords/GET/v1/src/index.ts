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
import {Bitmask, RESTfulAPI} from "api-microservices";
import { Phoenix } from './helpers/Phoenix';

module.exports = async function (req: any, res: any) {
  const client = new Client()
  await client.connect();

  // The request will already be parsed if handled by server.js
  let request = typeof req.payload === 'string' ? JSON.parse(req.payload) : req.payload;

  if(request.case_id && request.docbot_version) {
    if (!await Phoenix.docbotRecordExists(request.case_id, request.docbot_version, client)) {
      await client.end();
      return res.json(
          RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "Docbot Records do not exist for this case and docbot version", []),
          404
      );
    }
    let docbotRecords: any = await Phoenix.getDocuments(request.case_id, request.docbot_version, client);
    let documentIds: any = [];

    docbotRecords.forEach((record: any) => {
      documentIds.push([record.document_id, record.text_version]);
    });
    await client.end();
    return res.json(
        RESTfulAPI.response(
            Bitmask.REQUEST_SUCCESS,
            "All documents for case and docbot version below",
            {documents: documentIds}),
        200
    );
  } else {
    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "Must specify case_id and docbot_version", []), 400);
  }
};
