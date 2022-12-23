import { Client } from 'pg';
import { Phoenix } from '../helpers/Phoenix';

async function name() {
    const client = new Client()
    await client.connect();
    
    console.log(await Phoenix.caseExists(157, client));


    await client.end();
    
}


name();