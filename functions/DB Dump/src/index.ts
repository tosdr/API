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

import { fstat, mkdir, mkdirSync } from 'fs';
import { Client } from 'pg';
import * as fs from 'fs';
import NextcloudClient from 'nextcloud-link';
import JSZip from 'jszip';


type Context = {
  req: any;
  res: any;
  log: (msg: any) => void;
  error: (msg: any) => void;
};

export default async ({ req, res, log, error }: Context) => {

  const client = new Client();
  await client.connect();
  


    let services = JSON.stringify((await client.query('SELECT id, name, url, created_at, updated_at, wikipedia, keywords, related, slug, is_comprehensively_reviewed, rating, status FROM services;')).rows);
    let cases = JSON.stringify((await client.query('SELECT id, classification, score, title, description, topic_id, created_at, updated_at, privacy_related, docbot_regex FROM cases;')).rows);
    let documents = JSON.stringify((await client.query('SELECT id, name, url, xpath, text, created_at, updated_at, service_id, reviewed, user_id, crawler_server FROM documents;')).rows);
    let points = JSON.stringify((await client.query('SELECT id, rank, title, source, status, analysis, created_at, updated_at, service_id, quote_text, case_id, old_id, point_change, service_needs_rating_update, quote_start, quote_end, document_id, annotation_ref FROM points;')).rows);
    
    await client.end();

    let date = new Date().toString();


    const cloud = new NextcloudClient({
      "url":      "https://cloud.jrbit.de",
      "password": process.env.CLOUD_PASS,
      "username": process.env.CLOUD_USER,
    });

    await cloud.touchFolder("/tosdr/Public Dumps/" + date );
    await cloud.put("/tosdr/Public Dumps/" + date + "/services.json", services);
    await cloud.put("/tosdr/Public Dumps/" + date + "/cases.json", cases);
    await cloud.put("/tosdr/Public Dumps/" + date + "/documents.json", documents);
    await cloud.put("/tosdr/Public Dumps/" + date + "/points.json", points);

    return await res.send("OK");


  }