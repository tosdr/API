import { Client } from 'pg';


export class Phoenix {

  
  static async createSpamEntry(SpammableType: string, id: number, client: Client): Promise<any> {
    return (await client.query("INSERT INTO spams (spammable_type, spammable_id, flagged_by_admin_or_curator, cleaned, created_at, updated_at) VALUES ($1::text, $2::integer, true, false, now(), now())", [SpammableType, id]));
  }
}