import { Client } from 'pg';


export class Phoenix {

  
  static async caseExists(caseId: number, postgresClient: Client): Promise<boolean> {
    return (await postgresClient.query('SELECT (0) FROM cases WHERE id = $1::integer', [caseId])).rowCount > 0;
  }

  static async getCase(caseId: number, postgresClient: Client){
    return (await postgresClient.query('SELECT * FROM cases WHERE id = $1::integer', [caseId])).rows[0];
  }


}