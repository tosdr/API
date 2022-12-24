import { Client } from 'pg';


export class Phoenix {

  
  static async caseExists(caseId: number, postgresClient: Client): Promise<boolean> {
    return (await postgresClient.query('SELECT (0) FROM cases WHERE id = $1::integer', [caseId])).rowCount > 0;
  }

  static async getCase(caseId: number, postgresClient: Client): Promise<any> {
    return (await postgresClient.query('SELECT * FROM cases WHERE id = $1::integer', [caseId])).rows[0];
  }

  static async getAllCases(postgresClient: Client): Promise<Array<any>> {
    return (await postgresClient.query('SELECT * FROM cases')).rows;
  }

  static async countAllCases(postgresClient: Client): Promise<number> {
    return (await postgresClient.query('SELECT (0) FROM cases')).rowCount;
  }

  static async getAllCasesOffset(limit: number, offset: number, postgresClient: Client): Promise<Array<any>> {
    return (await postgresClient.query('SELECT * FROM cases LIMIT $1::integer OFFSET $2::integer', [limit, offset])).rows;
  }


}