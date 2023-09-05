import { Client } from 'pg';


export class Phoenix {

  // request.case_id, request.document_id, request.docbot_version, request.text_version, request.char_start, request.char_end, request.ml_score, client
  static async createDocbotRecord(caseId: number, documentId: number, docbotVersion: number, textVersion: string, charStart: number, charEnd: number, mlScore: number, postgresClient: Client): Promise<boolean> {
    return (await postgresClient.query("INSERT INTO Points (CaseId, DocumentId, DocbotVersion, TextVersion, CharStart, CharEnd, MlScore) VALUES ($1::integer, $2::integer, $3::string, $4::string, $5::integer, $6::number, $7::number)"));
  }

}