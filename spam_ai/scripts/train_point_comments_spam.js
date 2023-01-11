const natural = require('natural');
const sdk = require('node-appwrite');
const pg = require('pg');
const striphtml = require("string-strip-html");
const axios = require("axios");
const Amqp = require('amqp-ts');

let sql =`SELECT B.ID as UserID,
B.USERNAME,
A.SUMMARY
FROM POINT_COMMENTS A
INNER JOIN USERS B ON A.USER_ID = B.ID
WHERE B.ADMIN = FALSE
AND B.CURATOR = FALSE
AND B.BOT = FALSE
AND B.ID != 1
AND B.DEACTIVATED = false
AND A.SUMMARY LIKE '%https://%'
AND A.SUMMARY LIKE '%best%'
ORDER BY B.ID DESC`;


async function init(){


const client = new pg.Client();
await client.connect();


let result = (await client.query(sql)).rows;

let count = 1;
let totalcount = 0;

let userlist = [];

for (row of result){

    if(userlist.includes(row.userid)){
        continue;
    }

    userlist.push(row.userid);
};


for(user of userlist){

    console.log("Purging", user);


    let request = (await axios.delete("https://api.tosdr.org/spam/v1/?user=" + user, {
        "headers": {
            "apikey": process.env.TOSDR_API_KEY
        }
    })).statusText;

    console.log(request);

    count++;
    totalcount++;
    if(count == 5){
        count = 0;
        await new Promise(r => setTimeout(r, 1500));
    }
    console.log(totalcount, "/", userlist.length, "(", Math.round(totalcount / userlist.length * 100)+ "%", ")");
}

await client.end();






}

init();