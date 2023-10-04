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

  let request = JSON.parse(req.payload);
  if(request.id && request.docbot_version) {
    if (!await Phoenix.docbotRecordExists(request.id, request.docbot_version, client)) {
      await client.end();
      return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "Docbot Records do not exist for this case and docbot version", []), 404);
    }
    let docbotRecords: any = await Phoenix.getDocuments(request.id, request.docbot_version, client);
    let documentIds: any = [];

    docbotRecords.forEach((record: any) => {
      documentIds.push({
        "document_id": record.document_id,
        "text_version": record.text_version
      });
    });
    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "All documents for case and docbot version below", {
      documents: documentIds
    }));
  }
};
