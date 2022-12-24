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
      await client.end();
      return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "The Case does not exist!", []), 404);
    }
    


    let caseObj = await Phoenix.getCase(request.case, client);
  
    await client.end();


    return res.json({
      "id": Number(caseObj.id),
      "weight": Number(caseObj.score),
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
      "topic": Number(caseObj.topic_id),
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




  	
    let totalCases = await Phoenix.countAllCases(client);
    let casesPerPage = 100;
    let currentPage = Number.parseInt(request.page) ?? 1;

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
    
    let _calculatedPages = Math.ceil(totalCases / casesPerPage);
    /* If page is one then offset is zero */
    let _calculatedOffset = (currentPage === 1 ? 0 : ((currentPage - 1) * casesPerPage));

    
    console.log("totalCases", totalCases);
    console.log("casesPerPage", casesPerPage);
    console.log("currentPage", currentPage);
    console.log("_calculatedPages", _calculatedPages);
    console.log("_calculatedOffset", _calculatedOffset);


    if(currentPage > _calculatedPages){
      await client.end();
      return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "The Page Parameter is out of range!", {
        page: currentPage
      }), 400);
    }

    let phoenixCases = await Phoenix.getAllCasesOffset(casesPerPage, _calculatedOffset, client);


    let CasesSkel: any = [];    


    let _phoenixUrlCached = flags.getFeatureValue("phoenix_url");
    let _apiUrlCached = flags.getFeatureValue("crisp_api_url");

    phoenixCases.forEach((caseObj) => {
      CasesSkel.push({
        "id": Number(caseObj.id),
        "weight": Number(caseObj.score),
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
        "topic": Number(caseObj.topic_id),
        "classification": {
            "hex": caseObj.classification,
            "human": caseObj.classification
        },
        "links": {
          "phoenix": {
            "case": _phoenixUrlCached + "/case/" + caseObj.id,
            "new_comment": _phoenixUrlCached + "/case/" + caseObj.id + "/case_comments/new",
            "edit": _phoenixUrlCached + "/case/" + caseObj.id + "/edit"
          },
          "crisp": {
            "api": _apiUrlCached + "/case/v1/?case=" + caseObj.id,
          }
        }
      });
    });



  
  await client.end();


  return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "All cases below", {
    _page: {
      total: totalCases,
      current: currentPage,
      start: 1,
      end: _calculatedPages
    },
    cases: CasesSkel
  }));


};
