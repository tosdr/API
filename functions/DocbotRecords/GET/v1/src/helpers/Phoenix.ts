import { Client } from 'pg';

export class Phoenix {
  static async docbotRecordExists(caseId: number, modelVersion: string, postgresClient: Client): Promise<boolean> {
    return (await postgresClient.query('SELECT (0) FROM docbot_records WHERE case_id = $1::integer AND model_version = $2::string', [caseId, modelVersion])).rowCount > 0;
  }

  static async getDocuments(caseId: number, modelVersion: string, postgresClient: Client): Promise<boolean> {
    return (await postgresClient.query('SELECT * FROM docbot_records WHERE case_id = $1::integer AND model_version = $2::string', [caseId, modelVersion]))
  }
}