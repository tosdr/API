import { Client } from 'pg';


export class Phoenix {

  
  static async serviceExistsById(serviceId: number, postgresClient: Client): Promise<boolean> {
    return (await postgresClient.query('SELECT (0) FROM services WHERE id = $1::integer', [serviceId])).rowCount > 0;
  }

  static async serviceExistsBySlug(serviceSlug: string, postgresClient: Client): Promise<boolean> {
    return (await postgresClient.query('SELECT (0) FROM services WHERE slug = $1::text', [serviceSlug])).rowCount > 0;
  }

  static async getServiceById(serviceId: number, postgresClient: Client): Promise<any> {
    return (await postgresClient.query('SELECT * FROM services WHERE id = $1::integer', [serviceId])).rows[0];
  }

  static async getServiceBySlug(serviceSlug: string, postgresClient: Client): Promise<any> {
    return (await postgresClient.query('SELECT * FROM services WHERE slug = $1::text', [serviceSlug])).rows[0];
  }

  static async getAllServices(postgresClient: Client): Promise<Array<any>> {
    return (await postgresClient.query('SELECT * FROM services')).rows;
  }

  static async countAllServices(postgresClient: Client): Promise<number> {
    return (await postgresClient.query('SELECT (0) FROM services')).rowCount;
  }

  static async getAllServicesOffset(limit: number, offset: number, postgresClient: Client): Promise<Array<any>> {
    return (await postgresClient.query('SELECT * FROM services LIMIT $1::integer OFFSET $2::integer', [limit, offset])).rows;
  }


}