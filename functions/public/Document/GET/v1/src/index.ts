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

type Context = {
  req: any;
  res: any;
  log: (msg: any) => void;
  error: (msg: any) => void;
};

export default async ({ req, res, log, error }: Context) => {

  const client = new Client()
  await client.connect();

  if(req.query && 'id' in req.query) {
    if (!await Phoenix.documentExists(req.query.id, client)) {
      await client.end();
      return res.json(RESTfulAPI.response(
          Bitmask.INVALID_PARAMETER, "The Document does not exist", []), 404
      );
    }
    let docObj = await Phoenix.getDocumentById(req.query.id, client);
    await client.end();
    return res.json(
        RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "OK", {
          "id": Number(docObj.id),
          "name": docObj.name,
          "url": docObj.url,
          "text": docObj.text,
          "updated_at": docObj.updated_at,
          "created_at": docObj.created_at,
          "text_version": docObj.text_version,
          "service_id": docObj.service_id
        }),
        200
    );
  }

  let phoenixDocuments = await Phoenix.getAllDocumentIDs(client);
  let documentIds: any = [];

  phoenixDocuments.forEach((document: any) => {
    documentIds.push([document.id, document.text_version]);
  });
  
  await client.end();

  return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "All documents below", {
    documents: documentIds
  }), 200);
};
