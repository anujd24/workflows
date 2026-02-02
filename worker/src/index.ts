require('dotenv').config()

import { PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { Kafka } from "kafkajs";
import { sendEmail } from "./email";
import { parse } from "./parser";
import { sendUpi } from "./upi";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");


const TOPIC_NAME = "zap-events";
const prismaClient = new PrismaClient();

const getCaCert = () => {
    const base64Cert = process.env.KAFKA_CA_CERT;
    if (!base64Cert) {
        console.error("KAFKA_CA_CERT environment variable not found");
        return "";
    }
    return Buffer.from(base64Cert, 'base64').toString('utf-8');
};

const kafka = new Kafka({
    clientId : 'outbox-processor',
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"], 
    ssl: {
        ca: [getCaCert()],
        rejectUnauthorized: true    
    },
    sasl: {
        mechanism: 'scram-sha-256', 
        username: process.env.KAFKA_USERNAME || "",
        password: process.env.KAFKA_PASSWORD || "",
    }
})

async function runAiParser(actionMetadata: any, inputData: any) {
    console.log("ai parser started");
    
    const fields = actionMetadata.fields || []; 
    const instructions = actionMetadata.instructions || "Extract data";

    const textToProcess = typeof inputData === 'string' 
        ? inputData 
        : JSON.stringify(inputData);

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
        Role: You are a strict data extraction engine.
        Task: ${instructions}
        Fields to Extract: ${JSON.stringify(fields)}
        
        Input Data: "${textToProcess}"
        
        Rules:
        1. Return ONLY valid JSON.
        2. Extract AMOUNT as pure number (e.g. 5000, not "Rs 5000" or "$5000").
        3. Do not use Markdown (no \`\`\`json blocks).
        4. If a field is missing, set it to null.
        
        SPECIAL RULE FOR 'BODY' / 'MESSAGE':
        - Extract ONLY the actual content meant for the recipient.
        - Remove conversational fillers like "saying", "tell him that", "ask her if", "message is".
        - Example: Input "Send email saying Hello World" -> Output { "body": "Hello World" } (NOT "saying Hello World")
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const cleaned = response.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        
        console.log("ai output:", parsed);
        return parsed; 

    } catch (e) {
        console.error("ai parsing failed:", e);
        return { error: "Failed to parse" };
    }
}

async function main() {
    const consumer = kafka.consumer({
        groupId : "main-worker"
    });
    await consumer.connect();

    const producer = kafka.producer();
    await producer.connect();

    await consumer.subscribe({
        topic : TOPIC_NAME,
        fromBeginning : true
    })

    await consumer.run({
        autoCommit : false,
        eachMessage : async ({
            topic,
            partition,
            message
        }) => {
            console.log({
                topic,
                partition,
                offset : message.offset,
                value : message.value?.toString(),
            })
            try{
                if(!message.value){
                    return;
                }
                const parsedValue = JSON.parse(message.value.toString());
                const { zapRunId, stage } = parsedValue;

                console.log(`processing stage ${stage} for ZapRun: ${zapRunId}`);

                const zapRunDetails = await prismaClient.zapRun.findFirst({
                    where:{
                        id : zapRunId
                    },
                    include : {
                        zap : {
                            include: {
                                Action : {
                                    include : {
                                        AvailableAction : true  
                                    }
                                }
                            }
                        }
                    }
                });
                if(!zapRunDetails) {
                    return;
                }

                // rather than recursive pattern above , i can : 
                // 1) send a query to get back the zap id 
                // 2) send a query to get back the actions associated to this zap
                // 3) find the available actions

                const currentAction = zapRunDetails?.zap.Action.find(x => x.sortingOrder === stage);
                if(!currentAction){
                    console.log("current Action not found, maybe end of workflow?");
                    return;
                }
                
                const zapRunMetadata = zapRunDetails?.metadata as Record<string, any>;

                if(currentAction.AvailableAction.name === "email"){
                    const body = parse((currentAction.metadata as JsonObject)?.body as string, zapRunMetadata);
                    const to = parse((currentAction.metadata as JsonObject)?.email as string, zapRunMetadata);
                    console.log(`sending out Email to ${ to } body is ${ body}`);
                    await sendEmail(to, body, zapRunMetadata);
                }

                if(currentAction.AvailableAction.name === "upi"){ 
                    const amount = parse((currentAction.metadata as JsonObject)?.amount as string, zapRunMetadata);
                    const address = parse((currentAction.metadata as JsonObject)?.address as string, zapRunMetadata);
                    console.log(`Sending out upi of ${ amount } to address ${ address}`);
                    await sendUpi(address, amount);
                }
                
                if (currentAction.AvailableAction.id === "ai-parser") {
                    console.log("executing ai parser...");
                    
                    const aiResult = await runAiParser(currentAction.metadata, zapRunMetadata);
                    const newMetadata = { ...zapRunMetadata, ...aiResult };
                    await prismaClient.zapRun.update({
                        where: {
                            id: zapRunId
                        },
                        data: {
                            metadata: newMetadata
                        }
                    });

                    console.log("AI Data saved to DB");
                }

                await new Promise(r => setTimeout(r, 5000));
                
                const lastStage = (zapRunDetails?.zap.Action?.length || 1) - 1;

                if(lastStage !== stage){
                    console.log(`pushing next stage (${stage + 1}) to Kafka`);
                    await producer.send({
                        topic : TOPIC_NAME,
                        messages : [{                               
                            value : JSON.stringify({
                                stage : stage + 1,
                                zapRunId
                            })
                        }]
                    })
                }else{
                    console.log("workflow completed");
                }

                await consumer.commitOffsets([{
                    topic : TOPIC_NAME,
                    partition : partition,
                    offset: (parseInt(message.offset) + 1).toString()
                }])
            } catch(error){
                console.error("processing failed:", error);
            }
            
        },
    })
}

main();