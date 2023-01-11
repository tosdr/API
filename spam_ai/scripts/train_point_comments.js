const natural = require('natural');
const sdk = require('node-appwrite');
const pg = require('pg');
const striphtml = require("string-strip-html");
const axios = require("axios");
const Amqp = require('amqp-ts');

let sql =`SELECT SUMMARY
FROM POINT_COMMENTS
INNER JOIN USERS ON POINT_COMMENTS.USER_ID = USERS.ID
WHERE (USERS.ADMIN = TRUE
							OR USERS.CURATOR = TRUE)
	AND TRIM(SUMMARY) != 'approved:'
	AND TRIM(SUMMARY) != 'declined:'
	AND TRIM(SUMMARY) != 'changes-requested:'
	AND TRIM(SUMMARY) != 'Verified.'
	AND TRIM(SUMMARY) != 'Confirmed.'
	AND TRIM(SUMMARY) != 'Duplicate.'
	AND TRIM(SUMMARY) != 'approved: without comment'
	AND TRIM(SUMMARY) != 'approved: Point approved.'
	AND TRIM(SUMMARY) != 'declined: duplicate';`;


async function init(){


const client = new pg.Client();
await client.connect();


let result = (await client.query(sql)).rows;

var connection = new Amqp.Connection(process.env.AMQP_URL);
var queue = connection.declareQueue('spam_train', {durable: true});

let count = 1;


for (row of result){

    let filtered = striphtml.stripHtml(row.summary).result.replace("APPROVED", "").replace("CHANGES REQUESTED", "").replace("DECLINED", "").trim();


    if(filtered == "No comment given" || filtered == "CHANGES REQUESTED" || filtered == ""){
        continue;
    }


    var message = new Amqp.Message(JSON.stringify({
        "text": filtered,
        "type": "ham"
      }));
      queue.send(message);
      

    console.log("Sent message", count, connection.isConnected);
    count++;

};

await client.end();
await queue.close();
await connection.close();






}

init();