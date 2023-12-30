import { Client } from 'pg';


export class Phoenix {

  // request.case_id, request.document_id, request.docbot_version, request.text_version, request.char_start, request.char_end, request.ml_score, client
  static async createDocbotRecord(
      caseId: number, documentId: number, docbotVersion: string, textVersion: string, charStart: number, charEnd: number, mlScore: number, postgresClient: Client
  ): Promise<void> {
    await postgresClient.query(
        "INSERT INTO docbot_records (" +
        "case_id, document_id, docbot_version, text_version, char_start, char_end, ml_score, created_at, updated_at" +
        ") VALUES ($1::integer, $2::integer, $3::text, $4::text, $5::integer, $6::integer, $7::numeric, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        [caseId, documentId, docbotVersion, textVersion, charStart, charEnd, mlScore]
    );
  }
}