import { PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { Kafka } from "kafkajs";

const TOPIC_NAME = "zap-events";
const prismaClient = new PrismaClient();

const kafka = new Kafka({
    clientId : 'outbox-processor',
    brokers : ['localhost:9092'],
})

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
                partition,
                offset : message.offset,
                value : message.value?.toString(),
            })
            if(!message.value?.toString()){
                return;
            }
            const parsedValue = JSON.parse(message.value?.toString());
            const zapRunId = parsedValue.zapRunId;
            const stage = parsedValue.stage;

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

            // rather than recursive pattern above , i can : 
            // 1) send a query to get back the zap id 
            // 2) send a query to get back the actions associated to this zap
            // 3) find the available actions

            const currentAction = zapRunDetails?.zap.Action.find(x=>x.sortingOrder === stage);
            if(!currentAction){
                console.log("Current Action not found");
                return;
            }

            console.log(currentAction);

            if(currentAction.AvailableAction.name === "email"){
                console.log("Sending out an Email");
                const body = (currentAction.metadata as JsonObject)?.body;
                const to = (currentAction.metadata as JsonObject)?.email;
                const zapRunMetadata = zapRunDetails?.metadata;
                
                // parse out the email, body to send
            }

            if(currentAction.AvailableAction.name === "upi"){
                console.log("Sending out upi")
                // parse out the amount, address to send
            }
            //
            await new Promise(r => setTimeout(r, 5000));
            
            const lastStage = (zapRunDetails?.zap.Action?.length || 1) - 1;

            if(lastStage !== stage){
                await producer.send({
                    topic : TOPIC_NAME,
                    messages : [{
                        value : JSON.stringify({
                            stage : stage + 1,
                            zapRunId
                        })
                    }]
                })
            }

            console.log("processing done");
            //

            await consumer.commitOffsets([{
                topic : TOPIC_NAME,
                partition : partition,
                offset : (parseInt(message.offset + 1)).toString()
            }])
        },
    })
}

main();