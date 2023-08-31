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
  if(request.id && request.model_version) {
    if (!await Phoenix.docbotRecordExists(request.id, request.model_version, client)) {
      await client.end();
      return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "Docbot Records do not exist for this case and model version", []), 404);
    }
    let docbotRecords: any = await Phoenix.getDocuments(request.id, request.model_version, client);
    let documentIds: any = [];

    docbotRecords.forEach((record: any) => {
      let tuple = [];
      tuple.push(record.id);
      tuple.push(record.text_version)
      documentIds.push(tuple);
    });
    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "All documents for case and model version below", {
      documents: documentIds
    }));
  }
};