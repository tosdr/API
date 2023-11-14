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


  let services = (await client.query('SELECT id, name, rating, url, slug, is_comprehensively_reviewed, rating FROM services')).rows;

  let urls: any = {
    "tosdr/api/version": 1,
    "tosdr/data/version": Math.floor(Date.now() / 1000)
  };

  services.forEach(service => {
    let urlArray = service.url.trim().split(",");

    urlArray.forEach((url: any) => {
      urls["tosdr/review/" + url.trim()] = {
          "id": service.id,
          "documents": [],
          "logo": "https://s3.tosdr.org/logos/" + service.id + ".png",
          "name": service.name,
          "slug": service.slug,
          "rated": service.is_comprehensively_reviewed ? service.rating : false,
          "points": [],
      };
    });


  });


  await client.end();


  return res.json(urls);


};
