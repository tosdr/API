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
import {Bitmask, Document, RESTfulAPI} from "api-microservices";
import { Phoenix } from './helpers/Phoenix';

module.exports = async function (req: any, res: any) {

  const client = new Client()
  await client.connect();

  let request = JSON.parse(req.payload);
  if(request.id) {
    if (!await Phoenix.documentExists(request.id, client)) {
      await client.end();
      return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "The Document does not exist", []), 404);
    }
    let docObj = await Phoenix.getDocumentById(request.id, client);
    await client.end();
    res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "OK", Document.v1.fromRow(docObj).toObject()));
    return res.json();
  }

  let phoenixDocuments = await Phoenix.getAllDocuments(client);

  let documentIds: any = [];

  phoenixDocuments.forEach((document: any) => {
    let tuple = [];
    tuple.push(document.id);
    tuple.push(document.text_version)
    documentIds.push(tuple).toObject();
  });
  
  await client.end();

  return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "All documents below", {
    documents: documentIds
  }));
};
