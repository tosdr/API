import { Client } from 'pg';

export class Phoenix {
  static async pointsExist(caseId: number, modelVersion: string, postgresClient: Client): Promise<boolean> {
    return (await postgresClient.query('SELECT (0) FROM points WHERE case_id = $1::integer AND model_version = $2::string', [caseId, modelVersion])).rowCount > 0;
  }

  static async countAllPoints(postgresClient: Client): Promise<number> {
    return (await postgresClient.query('SELECT (0) FROM points')).rowCount;
  }

  static async getPointsForCase(caseId: number, modelVersion: string, postgresClient: Client): Promise<boolean> {
    return (await postgresClient.query('SELECT * FROM points WHERE case_id = $1::integer AND model_version = $2::string', [caseId, modelVersion]))
  }

  static async getAllPoints(postgresClient: Client): Promise<boolean> {
    return (await postgresClient.query('SELECT * FROM points'))
  }

  static async getAllPointsOffset(limit: number, offset: number, postgresClient: Client): Promise<Array<any>> {
    return (await postgresClient.query('SELECT * FROM points LIMIT $1::integer OFFSET $2::integer', [limit, offset])).rows;
  }
}