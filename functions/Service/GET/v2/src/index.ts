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
import { Bitmask } from "@tosdr/api-microservices";
import { Phoenix } from './helpers/Phoenix';
import { RESTfulAPI } from './helpers/RESTfulAPI';
import Flagsmith from 'flagsmith-nodejs';

 

module.exports = async function (req: any, res: any) {

  const client = new Client();
  await client.connect();
  
  const flagsmith = new Flagsmith({
    environmentKey: process.env.FLAGSMITH_KEY,
    apiUrl: process.env.FLAGSMITH_HOSTNAME,
   });
   const flags = await flagsmith.getEnvironmentFlags();



  let request = JSON.parse(req.payload);


  let topics = await Phoenix.getAllTopics(client);
  let cases = await Phoenix.getAllCases(client);

  if(request.id){


    let isServiceSlug = !/^\d+$/.test(request.id);

    console.log("request.id", request.id);
    console.log("isServiceSlug", isServiceSlug);

    if((isServiceSlug && !Phoenix.serviceExistsBySlug(request.id, client)) || (!isServiceSlug && !await Phoenix.serviceExistsById(Number(request.id), client))){
      await client.end();
      return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "The Service does not exist!", []), 404);
    }
    
    console.log(request.id, "exists");

    let serviceObj;

    if(isServiceSlug){
      console.log("Pulling using Slug");
      serviceObj = await Phoenix.getServiceBySlug(request.id, client);
    }else{
      console.log("Pulling using ID");
      serviceObj = await Phoenix.getServiceById(request.id, client);
    }
    
    console.log("serviceObj", serviceObj);


    console.log(request.id, "pulled");


    let documents: any = await Phoenix.getDocumentsOfService(serviceObj.id, client);
    let points: any = await Phoenix.getPointsOfService(serviceObj.id, client);

    console.log("documents", documents);



    let _documentsArray: any = [];
    let _pointsArray: any = [];


    documents.forEach((document: any) => {
      _documentsArray.push({
        id: Number(document.id),
        name: document.name,
        url: document.url,
        created_at: document.created_at,
        updated_at: document.updated_at
      });
    });


    points.forEach((point: any) => {

      let caseObj = cases.find(o => o.id === point.case_id);
      let topicObj = topics.find(o => o.id === caseObj.topic_id);

      _pointsArray.push({
        id: Number(point.id),
        title: point.title,
        source: point.source,
        status: point.status,
        analysis: point.analysis,
        created_at: point.created_at,
        updated_at: point.updated_at,
        case: {
          id: Number(caseObj.id),
          classification: caseObj.classification,
          weight: Number(caseObj.score),
          title: caseObj.title,
          description: caseObj.description,
          topic_id: Number(caseObj.topic_id)
        },
        quoteText: point.quoteText,
        document_id: point.document_id,
        quoteStart: point.quoteStart,
        quoteEnd: point.quoteEnd
      });
    });


    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "OK", {
      "id": Number(serviceObj.id),
      "is_comprehensively_reviewed": Boolean(serviceObj.is_comprehensively_reviewed),
      "name": serviceObj.name,
      "updated_at": serviceObj.updated_at,
      "created_at": serviceObj.created_at,
      "slug": serviceObj.slug,
      "rating":  serviceObj.is_comprehensively_reviewed ? serviceObj.rating : null,
      "urls": serviceObj.url.split(","),
      "image": flags.getFeatureValue("s3_url") + "/logos/"+ serviceObj.id + ".png",
      "documents": _documentsArray,
      "points": _pointsArray
    }));

  }




  	
    let totalServices = await Phoenix.countAllServices(client);
    let servicesPerPage = 100;
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


    let _phoenixUrlCached = flags.getFeatureValue("phoenix_url");
    let _apiUrlCached = flags.getFeatureValue("crisp_api_url");
    let _shieldUrlCached = flags.getFeatureValue("shield_url");
    let _crispUrlCached = flags.getFeatureValue("crisp_url");

    phoenixServices.forEach((serviceObj) => {
      serviceSkeleton.push({
        "id": Number(serviceObj.id),
        "is_comprehensively_reviewed": Number(serviceObj.is_comprehensively_reviewed),
        "name": serviceObj.name,
        "status": null,
        "urls": serviceObj.url.split(","),
        "updated_at": {
          'timezone': 'Europe/Berlin',
          'pgsql': serviceObj.updated_at,
          'unix': Math.floor(new Date(serviceObj.updated_at).getTime() / 1000)
        },
        "created_at": {
          'timezone': 'Europe/Berlin',
          'pgsql': serviceObj.created_at,
          'unix': Math.floor(new Date(serviceObj.created_at).getTime() / 1000)
        },
        "slug": Number(serviceObj.slug),
        "rating": {
            "hex": serviceObj.rating,
            "human": "Grade "+ serviceObj.rating,
            "letter": serviceObj.rating
        },
        "links": {
          "phoenix": {
            "service": _phoenixUrlCached + "/services/" + serviceObj.id,
            "documents": _phoenixUrlCached + "/services/" + serviceObj.id + "/annotate",
            "new_comment": _phoenixUrlCached + "/services/" + serviceObj.id + "/service_comments/new",
            "edit": _phoenixUrlCached + "/services/" + serviceObj.id + "/edit"
          },
          "crisp": {
            "api": _apiUrlCached + "/service/v1/?service=" + serviceObj.id,
            "service": _crispUrlCached + "/en/service/" + serviceObj.id,
            "badge": {
              "svg": _shieldUrlCached + "en_" + serviceObj.id + ".svg",
              "png": _shieldUrlCached + "en_" + serviceObj.id + ".png",
            }
          }
        }
      });
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
