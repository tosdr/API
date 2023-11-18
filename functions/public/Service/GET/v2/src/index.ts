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
import { Phoenix } from './helpers/Phoenix';
import {Case, DocumentMinimal, Service, ServiceMinimal, Bitmask, RESTfulAPI} from "api-microservices";
import {Points} from "api-microservices/build/models/Points";

 


type Context = {
  req: any;
  res: any;
  log: (msg: any) => void;
  error: (msg: any) => void;
};

export default async ({ req, res, log, error }: Context) => {

  const client = new Client();
  await client.connect();



  if(req.query && 'id' in req.query){

    if(isNaN(req.query.id) || !await Phoenix.serviceExistsById(Number(req.query.id), client)){
      await client.end();
      return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "The Service does not exist!", []), 404);
    }
    

    let serviceObj = await Phoenix.getServiceById(req.query.id, client);
    


    let cases = await Phoenix.getAllCases(client);
    let documents: any = await Phoenix.getDocumentsOfService(serviceObj.id, client);
    let points: any = await Phoenix.getPointsOfService(serviceObj.id, client);



    let _documentsArray: DocumentMinimal.v1[] = [];
    let _pointsArray: Points.v1[] = [];


    documents.forEach((document: any) => {
      _documentsArray.push(DocumentMinimal.v1.fromRow(document));
    });


    points.forEach((point: any) => {

      let caseObj = cases.find(o => o.id === point.case_id);




      _pointsArray.push(Points.v1.fromRow(point, Case.v2.fromRow(caseObj)));
    });

    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "OK", Service.v2.fromRow(
        serviceObj,
        "https://s3.tosdr.org/logos/"+ serviceObj.id + ".png",
        _documentsArray,
        _pointsArray
    ).toObject()));

  }




  	
    let totalServices = await Phoenix.countAllServices(client);
    let servicesPerPage = 100;
    let currentPage = Number.parseInt('page' in req.query ? req.query.page : 1);

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
    
    let _calculatedPages = Math.ceil(totalServices / servicesPerPage);
    /* If page is one then offset is zero */
    let _calculatedOffset = (currentPage === 1 ? 0 : ((currentPage - 1) * servicesPerPage));

    
    console.log("totalServices", totalServices);
    console.log("servicesPerPage", servicesPerPage);
    console.log("currentPage", currentPage);
    console.log("_calculatedPages", _calculatedPages);
    console.log("_calculatedOffset", _calculatedOffset);


    if(currentPage > _calculatedPages){
      await client.end();
      return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "The Page Parameter is out of range!", {
        page: currentPage
      }), 400);
    }

    let phoenixServices = await Phoenix.getAllServicesOffset(servicesPerPage, _calculatedOffset, client);


    let serviceSkeleton: any = [];

    phoenixServices.forEach((serviceObj) => {
      serviceSkeleton.push(ServiceMinimal.v1.fromRow(
          serviceObj,
          "https://s3.tosdr.org/logos/"+ serviceObj.id + ".png"
      ).toObject());
    });



  
  await client.end();


  return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "All services below", {
    _page: {
      total: totalServices,
      current: currentPage,
      start: 1,
      end: _calculatedPages
    },
    services: serviceSkeleton
  }));


};
