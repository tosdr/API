import { Bitmask } from "api-microservices";

export class RESTfulAPI {

  
  static response(error: Bitmask, message: string, Parameters: any = []): any {
    return {
      "error": error,
      "message": message,
      "parameters": Parameters
    };
  }



}