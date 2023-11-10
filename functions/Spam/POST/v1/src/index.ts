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

import { Bitmask } from 'api-microservices';
import { Spam } from './helpers/Spam';
import { RESTfulAPI } from './helpers/RESTfulAPI';
import * as Amqp from 'amqp-ts';

import * as natural from 'natural';





type Context = {
  req: any;
  res: any;
  log: (msg: any) => void;
  error: (msg: any) => void;
};

export default async ({ req, res, log, error }: Context) => {



  if (!req.query && !('text' in req.query)) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'text'"), 400);
  }

  if (!req.query && !('type' in req.query)) {
    return res.json(RESTfulAPI.response(Bitmask.MISSING_PARAMETER, "Missing Parameter 'type'"), 400);
  }


  if (req.query.type !== "ham" && req.query.type !== "spam") {
    await connection.close();
    return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "Invalid Parameter 'type' is not spam or ham"), 400);
  }

  var connection = new Amqp.Connection(process.env.AMQP_URL);
  var queue = connection.declareQueue('spam_train', { durable: true });

  var message = new Amqp.Message(JSON.stringify({
    "text": req.query.text.replace(/<\/?[^>]+(>|$)/g, ""),
    "type": req.query.type
  }));
  queue.send(message);

  await queue.close();
  await connection.close();

  return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "OK", {
    "trained": true,
    "type": req.query.type,
    "text": req.query.text
  }
  ));




};
