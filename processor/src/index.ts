import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";
import { Ca_Cert } from "./ca";
import dotenv from "dotenv";
dotenv.config();

const TOPIC_NAME = "zap-events";
const client = new PrismaClient;

const kafka = new Kafka({
    clientId : 'outbox-processor',
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"], 
    ssl: {
        ca : [Ca_Cert.replace(/\\r\\n/g, "\\n")],
        rejectUnauthorized : true,
        checkServerIdentity : () => undefined
    },
    sasl: {
        mechanism: 'scram-sha-256', 
        username: process.env.KAFKA_USERNAME || "",
        password: process.env.KAFKA_PASSWORD || "",
    }
})

async function main(){
    const producer = kafka.producer();
    try{
        await producer.connect();
        console.log("kafka connected")
    } catch(e){  
        console.error("kafka connection failed : ", e)
        process.exit(1);
    }
    

    while(1){
        const pendingRows = await client.zapRunOutbox.findMany({
            where :{},
            take : 10
        })
        console.log(pendingRows);

        if (pendingRows.length === 0) {
            console.log("queue empty, sleeping for 3 seconds.");
            await new Promise(r => setTimeout(r, 3000));
            continue; // again go at the start of the loop
        }

        try {
            console.log(`processing ${pendingRows.length} events`);
            producer.send({
                topic : TOPIC_NAME,
                messages : pendingRows.map(r => {
                    return {
                        value : JSON.stringify({zapRunId: r.zapRunId, stage : 0})
                    }
                })
            })

            await client.zapRunOutbox.deleteMany({
                where : {
                    id : {
                        in : pendingRows.map(x  => x.id)
                    }
                }
            });
        
        } catch (error){
            console.error("Error sending batch to Kafka:", error);
            await new Promise(r => setTimeout(r, 2000));
        }   
    }
}
main();