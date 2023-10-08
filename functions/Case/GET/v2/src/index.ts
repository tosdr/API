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
import {Bitmask, Case, RESTfulAPI} from "api-microservices";
import { Phoenix } from './helpers/Phoenix';


module.exports = async function (req: any, res: any) {

  const client = new Client()
  await client.connect();
  let request = req.payload;

  if(request.id){
    if(!await Phoenix.caseExists(request.id, client)){
      await client.end();
      return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "The Case does not exist!", []), 404);
    }

    let caseObj = await Phoenix.getCase(request.id, client);
    await client.end();

    return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "OK", Case.v2.fromRow(caseObj).toObject()));
  }
  	
    let totalCases = await Phoenix.countAllCases(client);
    let casesPerPage = 100;
    let currentPage = Number.parseInt(request.page ?? 1);

    if(!/^\d+$/.test(currentPage.toString())){
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

    if(currentPage > _calculatedPages){
      await client.end();
      return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "The Page Parameter is out of range!", {
        page: currentPage
      }), 400);
    }

    let phoenixCases = await Phoenix.getAllCasesOffset(casesPerPage, _calculatedOffset, client);
    let CasesSkel: any = [];

    phoenixCases.forEach((caseObj) => {
      CasesSkel.push(Case.v2.fromRow(caseObj).toObject());
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
