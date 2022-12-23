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
import { Bitmask } from './helpers/Bitmask';
import { Phoenix } from './helpers/Phoenix';
import { RESTfulAPI } from './helpers/RESTfulAPI';
import Flagsmith from 'flagsmith-nodejs';

 

module.exports = async function (req: any, res: any) {

  const client = new Client()
  await client.connect();
  
  const flagsmith = new Flagsmith({
    environmentKey: process.env.FLAGSMITH_KEY,
    apiUrl: process.env.FLAGSMITH_HOSTNAME,
   });
   const flags = await flagsmith.getEnvironmentFlags();




  let request = JSON.parse(req.payload);


  if(request.case){


    if(!await Phoenix.caseExists(request.case, client)){
      return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "The Case does not exist!", []), 404);
    }
    


    let caseObj = await Phoenix.getCase(request.case, client);


    return res.json({
      "id": caseObj.id as Number,
      "weight": caseObj.score as Number,
      "title": caseObj.title,
      "description": caseObj.description,
      "updated_at": {
        'timezone': 'Europe/Berlin',
        'pgsql': caseObj.updated_at,
        'unix': Math.floor(new Date(caseObj.updated_at).getTime() / 1000)
      },
      "created_at": {
        'timezone': 'Europe/Berlin',
        'pgsql': caseObj.created_at,
        'unix': Math.floor(new Date(caseObj.created_at).getTime() / 1000)
      },
      "topic": caseObj.topic_id as Number,
      "classification": {
          "hex": caseObj.classification,
          "human": caseObj.classification
      },
      "links": {
        "phoenix": {
          "case": flags.getFeatureValue("phoenix_url") + "/case/" + caseObj.id,
          "new_comment": flags.getFeatureValue("phoenix_url") + "/case/" + caseObj.id + "/case_comments/new",
          "edit": flags.getFeatureValue("phoenix_url") + "/case/" + caseObj.id + "/edit"
        },
        "crisp": {
          "api": flags.getFeatureValue("crisp_api_url") + "/case/v1/?case=" + caseObj.id,
        }
      }
    });

  }




  
  await client.end();


};
