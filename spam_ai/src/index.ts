import * as natural from 'natural';
import * as Amqp from "amqp-ts";


import { Spam } from './helpers/Spam';

async function init() {


      var connection = new Amqp.Connection(process.env.AMQP_URL);
      var queue = connection.declareQueue('spam_train', {durable: true});

      let classifier = natural.BayesClassifier.restore(JSON.parse(await Spam.loadClassifier()));



      let trainTimer: any;


      console.log("Started RabbitMQ Consumer");
      queue.activateConsumer(async (message) => {
        console.log("Received Spam Entry");
        let msgparsed = JSON.parse(message.getContent());
        classifier.addDocument(msgparsed.text, msgparsed.type);
        message.ack();
        
        clearTimeout(trainTimer);

        trainTimer = setTimeout(async function(){
          console.log("Training Model...");
          classifier.train();
          await Spam.saveClassifier(JSON.stringify(classifier));
        }, 5000)
        

      });

      
  
  }


  init();