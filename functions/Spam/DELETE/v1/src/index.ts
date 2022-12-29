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

import { Client, Query } from 'pg';
import { Bitmask } from './helpers/Bitmask';
import { Phoenix } from './helpers/Phoenix';
import { RESTfulAPI } from './helpers/RESTfulAPI';
import Flagsmith from 'flagsmith-nodejs';

const SpammableType = {
  topic: "TopicComment",
  case: "CaseComment",
  service: "ServiceComment",
  point: "PointComment",
  document: "DocumentComment"
};

module.exports = async function (req: any, res: any) {

  const client = new Client();
  await client.connect();
  let request = JSON.parse(req.payload);

  if (!request.user) {
    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'user'"), 400);
  } else if (!/^\d+$/.test(request.user)) {
    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "Parameter 'user' is NaN"), 400);
  }

  let User = (await client.query("SELECT * FROM users WHERE id = $1::integer", [request.user])).rows[0];

  console.log("User:", User);

  if(!User){
    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "User does not exist!"), 404);
  }else if(User.admin || User.bot || User.curator){
    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "User is protected!"), 400);
  }


  let CaseComments = (await client.query("SELECT * FROM case_comments WHERE user_id = $1::integer", [request.user])).rows;
  let DocumentComments = (await client.query("SELECT * FROM document_comments WHERE user_id = $1::integer", [request.user])).rows;
  let PointComments = (await client.query("SELECT * FROM point_comments WHERE user_id = $1::integer", [request.user])).rows;
  let ServiceComments = (await client.query("SELECT * FROM service_comments WHERE user_id = $1::integer", [request.user])).rows;
  let TopicComments = (await client.query("SELECT * FROM topic_comments WHERE user_id = $1::integer", [request.user])).rows;

  console.log("Retrieved all comments");

  /* Start Transaction */
  await client.query('BEGIN');

  let InsertedCaseComments = [];
  let InsertedDocumentComments = [];
  let InsertedPointComments = [];
  let InsertedServiceComments = [];
  let InsertedTopicComments = [];

  let FailedCaseComments = [];
  let FailedDocumentComments = [];
  let FailedPointComments = [];
  let FailedServiceComments = [];
  let FailedTopicComments = [];

  let UserHasBeenBlocked = false;


  try {

  for (const row of CaseComments) {
    let query = await Phoenix.createSpamEntry(SpammableType.case, row.id, client);

    console.log("CaseCommentsQuery:", query.command);
    if(query.rowCount > 0){
      InsertedCaseComments.push(query.command);
    }else {
      FailedCaseComments.push(query.command);
    }
  }


    for (const row of DocumentComments) {
      let query = await Phoenix.createSpamEntry(SpammableType.document, row.id, client);


      console.log("DocumentCommentsQuery:", query.command);
      if(query.rowCount > 0){
        InsertedDocumentComments.push(row);
      }else {
        FailedDocumentComments.push(row);
      }
    }


    for (const row of PointComments) {
      let query = await Phoenix.createSpamEntry(SpammableType.point, row.id, client);


      console.log("PointCommentsQuery:", query.command);
      if(query.rowCount > 0){
        InsertedPointComments.push(row);
      }else {
        FailedPointComments.push(row);
      }
    }


    for (const row of ServiceComments) {
      let query = await Phoenix.createSpamEntry(SpammableType.service, row.id, client);

      console.log("ServiceCommentsQuery:", query.command);

      if(query.rowCount > 0){
        InsertedServiceComments.push(row);
      }else {
        FailedServiceComments.push(row);
      }
    }


    for (const row of TopicComments) {
      let query = await Phoenix.createSpamEntry(SpammableType.topic, row.id, client);


      console.log("TopicCommentsQuery:", query.command);
      if(query.rowCount > 0){
        InsertedTopicComments.push(row);
      }else {
        FailedTopicComments.push(row);
      }
    }


    UserHasBeenBlocked = (await client.query("UPDATE users SET deactivated = true WHERE id = $1::integer", [request.user])).rowCount > 0;


    console.log("UserHasBeenBlocked:", UserHasBeenBlocked);
    await client.query("COMMIT");

  } catch(ex) {
    	await client.query("ROLLBACK");
  }






  await client.end();
  return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "OK", {
    "user": {
      "deactivated": UserHasBeenBlocked
    },
    "comments": {
      "total": CaseComments.length + DocumentComments.length + PointComments.length + ServiceComments.length + TopicComments.length,
      "case": {
        "total": CaseComments.length,
        "success": InsertedCaseComments.length,
        "failed": FailedCaseComments.length
      },
      "document": {
        "total": DocumentComments.length,
        "success": InsertedDocumentComments.length,
        "failed": FailedDocumentComments.length
      },
      "point": {
        "total": PointComments.length,
        "success": InsertedPointComments.length,
        "failed": FailedPointComments.length
      },
      "service": {
        "total": ServiceComments.length,
        "success": InsertedServiceComments.length,
        "failed": FailedServiceComments.length
      },
      "topic": {
        "total": TopicComments.length,
        "success": InsertedTopicComments.length,
        "failed": FailedTopicComments.length
      },
    }
  }));




};
