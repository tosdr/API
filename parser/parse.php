<?php

use tosdr\parser\AppwriteRequests;

include __DIR__ . "/vendor/autoload.php";


if($_SERVER["REQUEST_METHOD"] !== $_ENV["REQUEST_METHOD"]){
    http_response_code(405);
    exit;
}



switch($_SERVER["REQUEST_METHOD"]) {
    case "GET":

        AppwriteRequests::executeFunction("1", 2, $_GET);


        
        break;
}