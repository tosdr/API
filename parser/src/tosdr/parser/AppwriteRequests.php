<?php


namespace tosdr\parser;


use Appwrite\Client;
use Appwrite\Services\Functions;


class AppwriteRequests {

    public static function executeFunction($functionId, $projectId, $data){
        $client = new Client();

        $client->setEndpoint($_ENV["APPWRITE_HOSTNAME"])
            ->setProject($projectId)
            ->setKey($_ENV["APPWRITE_API_KEY"]);



        $functions = new Functions($client);


        return $functions->createExecution($functionId, $data);
    }
}