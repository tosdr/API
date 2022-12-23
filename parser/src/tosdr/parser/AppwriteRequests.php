<?php


namespace tosdr\parser;


use Appwrite\Client;
use Appwrite\Services\Functions;


class AppwriteRequests {

    public static function executeFunction($functionId, $data){
        $client = new Client();

        $client->setEndpoint($_ENV["APPWRITE_HOSTNAME"])
            ->setProject($_ENV["APPWRITE_PROJECT"])
            ->setKey($_ENV["APPWRITE_API_KEY"]);



        $functions = new Functions($client);

        return $functions->createExecution($functionId, json_encode($data));
    }
}