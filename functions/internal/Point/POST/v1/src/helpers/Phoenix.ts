import { Client } from 'pg';


export class Phoenix {

  static async createPoint(
      caseId: number, userId: number, documentId: number, serviceId: number, status: string,
      title: string, source: string, analysis: string, quote_text: string, quote_start: number, quote_end: number,
      docbotVersion: string, mlScore: number, postgresClient: Client
  ): Promise<any> {
    return (await postgresClient.query(
        "INSERT INTO Points (case_id, user_id, document_id, service_id, status, title, source, analysis, " +
        "quote_text, quote_start, quote_end, docbot_version, ml_score, created_at, updated_at) " +
        "VALUES ($1::integer, $2::integer, $3::integer, $4::integer, $5::text, $6::text, $7::text, " +
        "$8::text, $9::text, $10::integer, $11::integer, $12::text, $13::numeric, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        [caseId, userId, documentId, serviceId, status, title, source, analysis, quote_text, quote_start, quote_end, docbotVersion, mlScore]
    ));
  }

  static async getCase(caseId: number, postgresClient: Client): Promise<any> {
    return (await postgresClient.query('SELECT * FROM cases WHERE id = $1::integer', [caseId])).rows[0];
  }

}