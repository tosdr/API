import { Client } from 'pg';


export class Phoenix {

  // title, status, case id, user id, document id, topic id (from case), service id, docbot version
  static async createPoint(caseId: number, userId: number, documentId: number, topicId: number, serviceId: number, status: string, title: string, docbotVersion: string, postgresClient: Client): Promise<boolean> {
    return (await postgresClient.query("INSERT INTO Points (CaseId, UserId, DocumentId, TopicId, ServiceId, Status, Title, DocbotVersion) VALUES ($1::integer, $2::integer, $3::integer, $4::integer, $5::integer, $6::string, $7::string, $8::string)"));
  }

  static async getCase(caseId: number, postgresClient: Client): Promise<any> {
    return (await postgresClient.query('SELECT * FROM cases WHERE id = $1::integer', [caseId])).rows[0];
  }

}