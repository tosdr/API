import { Client } from 'pg';

export class Phoenix {
  static async getDocumentById(documentId: number, postgresClient: Client): Promise<any> {
    return (await postgresClient.query('SELECT * FROM documents WHERE id = $1::integer', [documentId])).rows[0];
  }

  static async documentExists(documentId: number, postgresClient: Client): Promise<boolean> {
    return (await postgresClient.query('SELECT (0) FROM documents WHERE id = $1::integer', [documentId])).rowCount > 0;
  }
  
  static async getAllDocuments(postgresClient: Client): Promise<Array<any>> {
    return (await postgresClient.query('SELECT * FROM documents')).rows;
  }

  static async getAllDocumentsOffset(limit: number, offset: number, postgresClient: Client): Promise<Array<any>> {
    return (await postgresClient.query('SELECT * FROM documents LIMIT $1::integer OFFSET $2::integer', [limit, offset])).rows;
  }

  static async countAllDocuments(postgresClient: Client): Promise<number> {
    return (await postgresClient.query('SELECT (0) FROM documents')).rowCount;
  }

}