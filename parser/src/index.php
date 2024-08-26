<?php

use Appwrite\Client;
use Appwrite\Services\Functions;

const SERVER_ERROR_JSON = [
    "error" => 0x1,
    "message" => "Internal Server Error",
    "parameters" => ["Trace" => "ParserProxy"]
];

try {
    require __DIR__ . "/vendor/autoload.php";

    // $_POST only handles form data (application/x-www-form-urlencoded or multipart/form-data)
    // but for application/json data we'll read from php://input
    $body = file_get_contents("php://input");

    $client = new Client();

    $client->setEndpoint($_ENV["APPWRITE_HOSTNAME"])->setProject($_ENV["APPWRITE_PROJECT"])->setKey($_ENV["APPWRITE_API_KEY"]);

    $functions = new Functions($client);

    $execution = $functions->createExecution(
        functionId: $_SERVER['HTTP_X_FUNCTION_ID'],
        body: $body,
        async: false,
        xpath: $_SERVER['REQUEST_URI'],
        method: $_SERVER["REQUEST_METHOD"]
    );

    if ($execution["status"] !== "completed") {
        http_response_code($execution["responseStatusCode"]);
        header("Content-Type: application/json");
        echo strlen($execution["responseBody"]) > 0 ? $execution["responseBody"] : json_encode(SERVER_ERROR_JSON);
        exit;
    }

    header("Content-Type: application/json");

    echo $execution["responseBody"];
} catch (Exception $ex) {
    echo json_encode(SERVER_ERROR_JSON);
    error_log($ex);
}
