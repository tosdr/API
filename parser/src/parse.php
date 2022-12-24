<?php

use tosdr\parser\AppwriteRequests;

include __DIR__ . "/vendor/autoload.php";

if($_SERVER["REQUEST_METHOD"] !== $_ENV["REQUEST_METHOD"]){
    http_response_code(405);
    exit;
}



$parameters = match($_SERVER["REQUEST_METHOD"]){
    "GET" => $_GET,
    "POST" => $_POST,
    "DELETE" => $_GET,
    "PUT" => file_get_contents("php://input")
};

$request = AppwriteRequests::executeFunction($_SERVER['HTTP_X_FUNCTION_ID'], $parameters);

if($request["status"] !== "completed"){
    return http_response_code($request["statusCode"]);
}

header("Content-Type: application/json");

echo $request["response"];