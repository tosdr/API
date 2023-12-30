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
import {Bitmask, Points, Case, RESTfulAPI} from "api-microservices";
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
    if (!await Phoenix.pointExists(req.query.id, client)) {
      await client.end();
      return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "Point not found", []), 404);
    }
    let point = await Phoenix.getPoint(req.query.id, client);

    if(!await Phoenix.caseExists(point.case_id, client)){
      await client.end();
      return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "The Case does not exist!", []), 404);
    }
    let caseResponse = await Phoenix.getCase(point.case_id, client);
    await client.end();
    let caseObj = Case.v2.fromRow(caseResponse)

    return res.json(
        RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "OK", Points.v1.fromRow(point, caseObj).toObject()),
        200
    );
  } else if (req.query && 'case_id' in req.query) {
    if (!await Phoenix.casePointsExist(req.query.case_id, client)) {
      await client.end();
      return res.json(
          RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "Points belonging to this case do not exist", []),
          404
      );
    }

    let totalPoints = await Phoenix.countAllCasePoints(req.query.case_id, client);
    let pointsPerPage = 100;
    let currentPage = Number.parseInt(req.query.page ?? 1);

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

    let _calculatedPages = Math.ceil(totalPoints / pointsPerPage);
    /* If page is one then offset is zero */
    let _calculatedOffset = (currentPage === 1 ? 0 : ((currentPage - 1) * pointsPerPage));

    console.log("totalPoints", totalPoints);
    console.log("servicesPerPage", pointsPerPage);
    console.log("currentPage", currentPage);
    console.log("_calculatedPages", _calculatedPages);
    console.log("_calculatedOffset", _calculatedOffset);

    if(currentPage > _calculatedPages){
      await client.end();
      return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "The Page Parameter is out of range!", {
        page: currentPage
      }), 400);
    }

    let phoenixPoints: any = await Phoenix.getCasePointsOffset(req.query.case_id, pointsPerPage, _calculatedOffset, client);
    let pointsSkeleton: any = [];

    // Get the associated Case object
    if(!await Phoenix.caseExists(req.query.case_id, client)){
      await client.end();
      return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "The Case does not exist!", []), 404);
    }
    let caseResponse = await Phoenix.getCase(req.query.case_id, client);
    await client.end();
    let caseObj = Case.v2.fromRow(caseResponse)

    phoenixPoints.forEach((pointObj: any) => {
      pointsSkeleton.push(Points.v1.fromRow(pointObj, caseObj).toObject());
    });

    await client.end();

    return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "Case points below", {
      _page: {
        total: totalPoints,
        current: currentPage,
        start: 1,
        end: _calculatedPages
      },
      points: pointsSkeleton
    }), 200);
  } else {
    return res.json(
        RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "Getting all points not supported. Pass a point ID or case ID", []),
        400
    );
  }
};
