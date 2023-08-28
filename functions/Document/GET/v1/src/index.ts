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

  let totalDocuments = await Phoenix.countAllDocuments(client);
  let documentsPerPage = 100;
  let currentPage = Number.parseInt(request.page ?? 1);

  if(!Number.isInteger(currentPage)){
    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "The Page Parameter is not a number!", {
      page: currentPage
    }), 400);
  }

  /* Check if page is zero or below */
  if(currentPage < 1){
    currentPage = 1;
  }
  
  let _calculatedPages = Math.ceil(totalDocuments / documentsPerPage);
  /* If page is one then offset is zero */
  let _calculatedOffset = (currentPage === 1 ? 0 : ((currentPage - 1) * documentsPerPage));

  console.log("totalDocuments", totalDocuments);
  console.log("documentsPerPage", documentsPerPage);
  console.log("currentPage", currentPage);
  console.log("_calculatedPages", _calculatedPages);
  console.log("_calculatedOffset", _calculatedOffset);

  if(currentPage > _calculatedPages){
    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "The Page Parameter is out of range!", {
      page: currentPage
    }), 400);
  }

  let phoenixDocuments = await Phoenix.getAllDocumentsOffset(documentsPerPage, _calculatedOffset, client);

  let documentSkeleton: any = [];

  phoenixDocuments.forEach((document: any) => {
    documentSkeleton.push(document.id).toObject();
  });
  
  await client.end();

  return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "All documents below", {
    _page: {
      total: totalDocuments,
      current: currentPage,
      start: 1,
      end: _calculatedPages
    },
    documents: documentSkeleton
  }));
};
