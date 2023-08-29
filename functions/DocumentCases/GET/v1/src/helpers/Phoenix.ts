import { Client } from 'pg';

export class Phoenix {
  static async documentExists(documentId: number, postgresClient: Client): Promise<boolean> {
    return (await postgresClient.query('SELECT (0) FROM documents WHERE id = $1::integer', [documentId])).rowCount > 0;
  }

  static async getPointsOfDocument(documentId: number, postgresClient: Client): Promise<any> {
    return (await postgresClient.query('SELECT * FROM points WHERE document_id = $1::integer', [documentId])).rows;
  }

  static async getCasesOfDocument(documentId: number, postgresClient: Client): Promise<any> {
    const points = await this.getPointsOfDocument(documentId, postgresClient);
    const cases = points.map((p: any) => p.case_id)
    return Array.from( new Set( cases ) )
  }
}