import { Client } from 'pg';


export class Phoenix {

  
  static async createSpamEntry(SpammableType: string, id: number, client: Client): Promise<any> {
    return (await client.query("INSERT INTO spams (spammable_type, spammable_id, flagged_by_admin_or_curator, cleaned) VALUES ($1::string, $2::integer, true, false)", [SpammableType, id]));
  }


}