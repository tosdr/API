import { Client } from 'pg';

export class Phoenix {
  static async pointExists(id: number, postgresClient: Client): Promise<boolean> {
    return (await postgresClient.query('SELECT (0) FROM points WHERE id = $1::integer', [id])).rowCount > 0;
  }

  static async casePointsExist(caseId: number, postgresClient: Client): Promise<boolean> {
    return (await postgresClient.query('SELECT (0) FROM points WHERE case_id = $1::integer', [caseId])).rowCount > 0;
  }

  static async countAllCasePoints(postgresClient: Client): Promise<number> {
    return (await postgresClient.query('SELECT (0) FROM points')).rowCount;
  }

  static async getCasePoints(caseId: number, postgresClient: Client): Promise<Array<any>> {
    return (await postgresClient.query('SELECT * FROM points WHERE case_id = $1::integer', [caseId])).rows
  }

  static async getCasePointsOffset(caseId: number, limit: number, offset: number, postgresClient: Client): Promise<Array<any>> {
    return (await postgresClient.query('SELECT * FROM points WHERE case_id = $1::integer LIMIT $2::integer OFFSET $3::integer', [caseId, limit, offset])).rows;
  }
}