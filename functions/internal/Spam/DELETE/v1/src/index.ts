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

import * as Amqp from 'amqp-ts';
import * as natural from 'natural';
import { Client } from 'pg';
import { Bitmask } from 'api-microservices';
import { Phoenix } from './helpers/Phoenix';
import { Spam } from './helpers/Spam';
import { RESTfulAPI } from './helpers/RESTfulAPI';

const SpammableType = {
  topic: "TopicComment",
  case: "CaseComment",
  service: "ServiceComment",
  point: "PointComment",
  document: "DocumentComment"
};




type Context = {
  req: any;
  res: any;
  log: (msg: any) => void;
  error: (msg: any) => void;
};

export default async ({ req, res, log, error }: Context) => {


  var connection = new Amqp.Connection(process.env.AMQP_URL);
  var queue = connection.declareQueue('spam_train', {durable: true});


  const client = new Client();
  await client.connect();
  let DryRun = 'dryrun' in req.query;

  if (!req.query && !('user' in req.query)) {
    await client.end();
    await connection.close();
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'user'"), 400);
  } else if (!/^\d+$/.test(req.query.user)) {
    await client.end();
    await connection.close();
    return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "Parameter 'user' is NaN"), 400);
  }

  let User = (await client.query("SELECT * FROM users WHERE id = $1::integer", [req.query.user])).rows[0];

  console.log("User:", User);

  if(!User){
    await client.end();
    await connection.close();
    return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "User does not exist!"), 404);
  }else if(User.admin || User.bot || User.curator){
    await client.end();
    await connection.close();
    return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "User is protected!"), 400);
  }


  let CaseComments = (await client.query("SELECT * FROM case_comments WHERE user_id = $1::integer", [req.query.user])).rows;
  let DocumentComments = (await client.query("SELECT * FROM document_comments WHERE user_id = $1::integer", [req.query.user])).rows;
  let PointComments = (await client.query("SELECT * FROM point_comments WHERE user_id = $1::integer", [req.query.user])).rows;
  let ServiceComments = (await client.query("SELECT * FROM service_comments WHERE user_id = $1::integer", [req.query.user])).rows;
  let TopicComments = (await client.query("SELECT * FROM topic_comments WHERE user_id = $1::integer", [req.query.user])).rows;

  console.log("Retrieved all comments");

  /* Start Transaction */
  if(!DryRun) {
    await client.query('BEGIN');  
  }

  console.log("DryRun", DryRun);

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
    let query;
    if(!DryRun) {

      var message = new Amqp.Message(JSON.stringify({
        "text": row.summary.replace(/<\/?[^>]+(>|$)/g, ""),
        "type": "spam"
      }));
      queue.send(message);
      query = (await Phoenix.createSpamEntry(SpammableType.case, row.id, client)).rowCount;
    }else{
      query = 1;
    }

    console.log("CaseCommentsQuery:", query);
    if(query > 0){
      InsertedCaseComments.push(query);
    }else {
      FailedCaseComments.push(query);
    }
  }


    for (const row of DocumentComments) {
      let query;
      if(!DryRun) {
        var message = new Amqp.Message(JSON.stringify({
          "text": row.summary.replace(/<\/?[^>]+(>|$)/g, ""),
          "type": "spam"
        }));
        queue.send(message);
        query = (await Phoenix.createSpamEntry(SpammableType.document, row.id, client)).rowCount;
      }else{
        query = 1;
      }

      console.log("DocumentCommentsQuery:", query);
      if(query > 0){
        InsertedDocumentComments.push(row);
      }else {
        FailedDocumentComments.push(row);
      }
    }


    for (const row of PointComments) {
      let query;
      if(!DryRun) {
        var message = new Amqp.Message(JSON.stringify({
          "text": row.summary.replace(/<\/?[^>]+(>|$)/g, ""),
          "type": "spam"
        }));
        queue.send(message);
        query = (await Phoenix.createSpamEntry(SpammableType.point, row.id, client)).rowCount;
      }else{
        query = 1;
      }


      console.log("PointCommentsQuery:", query);
      if(query > 0){
        InsertedPointComments.push(row);
      }else {
        FailedPointComments.push(row);
      }
    }


    for (const row of ServiceComments) {
      let query;
      if(!DryRun) {
        var message = new Amqp.Message(JSON.stringify({
          "text": row.summary.replace(/<\/?[^>]+(>|$)/g, ""),
          "type": "spam"
        }));
        queue.send(message);
        query = (await Phoenix.createSpamEntry(SpammableType.service, row.id, client)).rowCount;
      }else{
        query = 1;
      }

      console.log("ServiceCommentsQuery:", query);

      if(query > 0){
        InsertedServiceComments.push(row);
      }else {
        FailedServiceComments.push(row);
      }
    }


    for (const row of TopicComments) {
      let query;
      if(!DryRun) {
        var message = new Amqp.Message(JSON.stringify({
          "text": row.summary.replace(/<\/?[^>]+(>|$)/g, ""),
          "type": "spam"
        }));
        queue.send(message);
        query = (await Phoenix.createSpamEntry(SpammableType.topic, row.id, client)).rowCount;
      }else{
        query = 1;
      }


      console.log("TopicCommentsQuery:", query);
      if(query > 0){
        InsertedTopicComments.push(row);
      }else {
        FailedTopicComments.push(row);
      }
    }



   if(!DryRun) {
     UserHasBeenBlocked = (await client.query("UPDATE users SET deactivated = true WHERE id = $1::integer", [req.query.user])).rowCount > 0;
   }else{
     UserHasBeenBlocked = true;
   }

    console.log("UserHasBeenBlocked:", UserHasBeenBlocked);
    if(!DryRun) {
      await client.query("COMMIT");
    }

  } catch(ex) {
    console.log("Exception", ex.message);
    if(!DryRun) {
      await client.query("ROLLBACK");
    }
    await client.end();
    await connection.close();
    return res.json(RESTfulAPI.response(Bitmask.GENERIC_ERROR, "SERVER ERROR"));
  }






  await connection.close();
  await client.end();
  return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "OK", {
    "dryrun": DryRun,
    "user": {
      "username": User.username,
      "id": User.id,
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

  }
