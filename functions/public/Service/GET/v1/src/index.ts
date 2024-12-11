import { Client } from 'pg';
import { Bitmask } from "@tosdr/api-microservices";
import { Phoenix } from './helpers/Phoenix';
import { RESTfulAPI } from './helpers/RESTfulAPI';
import Flagsmith from 'flagsmith-nodejs';

type Context = {
  req: any;
  res: any;
  log: (msg: any) => void;
  error: (msg: any) => void;
};

export default async ({ req, res, log, error }: Context) => {

  const client = new Client();
  await client.connect();
  
  const flagsmith = new Flagsmith({
    environmentKey: process.env.FLAGSMITH_KEY,
    apiUrl: process.env.FLAGSMITH_HOSTNAME,
   });
   const flags = await flagsmith.getEnvironmentFlags();
  



  if(req.query && 'service' in req.query){


    let isServiceSlug = !/^\d+$/.test(req.query.service);

    log("req.query.service " + req.query.service);
    log("isServiceSlug" + isServiceSlug);

    if((isServiceSlug && !Phoenix.serviceExistsBySlug(req.query.service, client)) || (!isServiceSlug && !await Phoenix.serviceExistsById(Number(req.query.service), client))){
      await client.end();
      return res.json(RESTfulAPI.response(Bitmask.INVALID_PARAMETER, "The Service does not exist!", []), 404);
    }
    
    log(req.query.service + "exists");

    let serviceObj;

    if(isServiceSlug){
      log("Pulling using Slug");
      serviceObj = await Phoenix.getServiceBySlug(req.query.service, client);
    }else{
      log("Pulling using ID");
      serviceObj = await Phoenix.getServiceById(req.query.service, client);
    }
    


    let documents: any = await Phoenix.getDocumentsOfService(serviceObj.id, client);
    let points: any = await Phoenix.getPointsOfService(serviceObj.id, client);


    let _documentsArray: any = [];
    let _pointsArray: any = [];


    documents.forEach((document: any) => {
      _documentsArray.push({
        id: document.id,
        name: document.name,
        url: document.url,
        xpath: document.xpath,
        text: document.text,
        created_at: document.created_at,
        updated_at: document.updated_at
      });
    });


    points.forEach((point: any) => {
      _pointsArray.push({
        id: Number(point.id),
        title: point.title,
        source: point.source,
        status: point.status,
        analysis: point.analysis,
        created_at: point.created_at,
        updated_at: point.updated_at,
        quote_text: point.quote_text,
        case_id: Number(point.case_id),
        document_id: point.document_id,
        quote_start: point.quote_start,
        quote_end: point.quote_end
      });
    });


    await client.end();
    return res.json(RESTfulAPI.response(Bitmask.REQUEST_SUCCESS, "OK", {
      "id": Number(serviceObj.id),
      "is_comprehensively_reviewed": Number(serviceObj.is_comprehensively_reviewed),
      "name": serviceObj.name,
      "status": null,
      "updated_at": serviceObj.updated_at,
      "created_at": serviceObj.created_at,
      "slug": Number(serviceObj.slug),
      "rating": "Grade "+ serviceObj.rating,
      "urls": serviceObj.url.split(","),
      "url": serviceObj.url,
      "image": flags.getFeatureValue("s3_url") + "/logos/"+ serviceObj.id + ".png",
      "documents": _documentsArray,
      "points": _pointsArray
    }));

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
