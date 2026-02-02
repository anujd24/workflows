import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

const TOPIC_NAME = "zap-events";
const client = new PrismaClient;

function getSSLConfig() {
    const base64Cert = process.env.KAFKA_CA_CERT;
    
    if (base64Cert) {
        console.log(" CA Certificate detected in Env Vars. Decoding...");
        try {
            const ca = Buffer.from(base64Cert, 'base64').toString('utf-8');
            return {
                ca: [ca],
                rejectUnauthorized: true
            };
        } catch (e) {
            console.error(" Failed to decode Certificate. Falling back to INSECURE mode.");
        }
    } else {
        console.log(" No CA Certificate found. Using INSECURE mode (rejectUnauthorized: false).");
    }
    return {
        rejectUnauthorized: false
    };
}

const kafka = new Kafka({
    clientId : 'outbox-processor',
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"], 
    ssl: getSSLConfig(),
    sasl: {
        mechanism: 'scram-sha-256', 
        username: process.env.KAFKA_USERNAME || "",
        password: process.env.KAFKA_PASSWORD || "",
    }
})

async function main(){
    const producer = kafka.producer();
    await producer.connect();

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
            await new Promise(r => setTimeout(r, 1000));
        }   
    }
}
main();