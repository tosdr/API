<?php

use tosdr\parser\AppwriteRequests;

include __DIR__ . "/vendor/autoload.php";

$parameters = match($_SERVER["REQUEST_METHOD"]){
    "GET", "DELETE" => $_GET,
    "POST" => $_POST,
    "PUT" => file_get_contents("php://input")
};

$request = AppwriteRequests::executeFunction($_SERVER['HTTP_X_FUNCTION_ID'], $parameters);

if($request["status"] !== "completed"){
    return http_response_code($request["statusCode"]);
}

header("Content-Type: application/json");

echo $request["response"];