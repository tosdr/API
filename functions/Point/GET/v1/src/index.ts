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
import {Bitmask, Points, RESTfulAPI} from "api-microservices";
import { Phoenix } from './helpers/Phoenix';

module.exports = async function (req: any, res: any) {
  const client = new Client()
  await client.connect();

  let request = JSON.parse(req.payload);

  if(request.id && request.model_version) {
    if (!await Phoenix.pointsExist(request.id, request.model_version, client)) {
      await client.end();
      return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "Points with this model version and belonging to this case do not exist", []), 404);
    }
    let points = await Phoenix.getPointsForCase(request.id, request.model_version, client);
    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "OK", Points.v1.fromRow(points).toObject()));
  }

  let totalPoints = await Phoenix.countAllPoints(client);
  let pointsPerPage = 100;
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

  let phoenixPoints: any = await Phoenix.getAllPointsOffset(pointsPerPage, _calculatedOffset, client);

  let pointsSkeleton: any = [];

  phoenixPoints.forEach((pointObj: any) => {
    pointsSkeleton.push(Points.v1.fromRow(pointObj).toObject());
  });
  
  await client.end();

  return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "All points below", {
    _page: {
      total: totalPoints,
      current: currentPage,
      start: 1,
      end: _calculatedPages
    },
    points: pointsSkeleton
  }));
};
