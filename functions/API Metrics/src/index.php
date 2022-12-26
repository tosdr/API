<?php

use Appwrite\Client;

// You can remove imports of services you don't use
use Appwrite\Services\Account;
use Appwrite\Services\Avatars;
use Appwrite\Services\Databases;
use Appwrite\Services\Functions;
use Appwrite\Services\Health;
use Appwrite\Services\Locale;
use Appwrite\Services\Storage;
use Appwrite\Services\Teams;
use Appwrite\Services\Users;

require_once 'vendor/autoload.php';

/*
  '$req' variable has:
    'headers' - object with request headers
    'payload' - request body data as a string
    'variables' - object with function variables

  '$res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200

  If an error is thrown, a response with code 500 will be returned.
*/

return function ($req, $res) {

  $opts = [
      "http" => [
          "method" => "GET",
          "header" => "User-Agent: Statuspage API Metrics\r\n"
      ]
  ];

  // DOCS: https://www.php.net/manual/en/function.stream-context-create.php
  $context = stream_context_create($opts);


  $start = microtime();
  file_get_contents("https://api.tosdr.org", false, $context);
  $end = microtime();
  

  $API_KEY = $_ENV["STATUSPAGE_API_KEY"];
  $PAGE_ID = 'rksyl9kf1wtg';
  $METRIC_ID = 'jyy82w8jzpvp';
  $BASE_URI = 'https://api.statuspage.io/v1';
 
  $ch = curl_init(sprintf("%s/pages/%s/metrics/%s/data.json", $BASE_URI, $PAGE_ID, $METRIC_ID));
  curl_setopt($ch, CURLOPT_HTTPHEADER, array(
      "Authorization: OAuth " . $API_KEY,
      "Expect: 100-continue"
    )
  );
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

  $ts = time();


  $milliseconds = floor(($end - $start) * 1000);


  if($milliseconds < 1){
    return exit(1);
  }

  $postparams = array(
    "data[timestamp]" => $ts,
    "data[value]" => $milliseconds
  );
  curl_setopt($ch, CURLOPT_POSTFIELDS, $postparams);
  $resultStringified = curl_exec($ch);

  $result = json_decode($resultStringified);
  $error = $result->error;

  if ($error) {
    return $res->send("Error encountered. Please ensure that your page code and authorization key are correct.", 500);
  }

  $res->send("Time: " . $milliseconds);

};