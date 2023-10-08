import { Client } from 'pg';


export class Phoenix {

  static async createPoint(
      caseId: number, userId: number, documentId: number, topicId: number, serviceId: number, status: string,
      title: string, source: string, analysis: string, quoteText: string, quoteStart: number, quoteEnd: number,
      docbotVersion: string, mlScore: number, postgresClient: Client
  ): Promise<any> {
    return (await postgresClient.query(
        "INSERT INTO Points (case_id, user_id, document_id, topic_id, service_id, status, title, source, analysis, " +
        "quote_text, quote_start, quote_end, docbot_version, ml_score, created_at, updated_at) " +
        "VALUES ($1::integer, $2::integer, $3::integer, $4::integer, $5::integer, $6::string, $7::string, $8::string, " +
        "$9::string, $10::string, $11:integer, $12::integer, $13::string, $14::numeric, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        [caseId, userId, documentId, topicId, serviceId, status, title, source, analysis, quoteText, quoteStart, quoteEnd, docbotVersion, mlScore]
    ));
  }

  static async getCase(caseId: number, postgresClient: Client): Promise<any> {
    return (await postgresClient.query('SELECT * FROM cases WHERE id = $1::integer', [caseId])).rows[0];
  }

}