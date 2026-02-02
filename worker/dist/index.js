"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const client_1 = require("@prisma/client");
const kafkajs_1 = require("kafkajs");
const email_1 = require("./email");
const parser_1 = require("./parser");
const upi_1 = require("./upi");
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const TOPIC_NAME = "zap-events";
const prismaClient = new client_1.PrismaClient();
const kafka = new kafkajs_1.Kafka({
    clientId: 'outbox-processor',
    brokers: ['localhost:9092'],
});
function runAiParser(actionMetadata, inputData) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const result = yield model.generateContent(prompt);
            const response = result.response.text();
            const cleaned = response.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleaned);
            console.log("ai output:", parsed);
            return parsed;
        }
        catch (e) {
            console.error("ai parsing failed:", e);
            return { error: "Failed to parse" };
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const consumer = kafka.consumer({
            groupId: "main-worker"
        });
        yield consumer.connect();
        const producer = kafka.producer();
        yield producer.connect();
        yield consumer.subscribe({
            topic: TOPIC_NAME,
            fromBeginning: true
        });
        yield consumer.run({
            autoCommit: false,
            eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ topic, partition, message }) {
                var _b, _c, _d, _e, _f, _g;
                console.log({
                    topic,
                    partition,
                    offset: message.offset,
                    value: (_b = message.value) === null || _b === void 0 ? void 0 : _b.toString(),
                });
                try {
                    if (!message.value) {
                        return;
                    }
                    const parsedValue = JSON.parse(message.value.toString());
                    const { zapRunId, stage } = parsedValue;
                    console.log(`processing stage ${stage} for ZapRun: ${zapRunId}`);
                    const zapRunDetails = yield prismaClient.zapRun.findFirst({
                        where: {
                            id: zapRunId
                        },
                        include: {
                            zap: {
                                include: {
                                    Action: {
                                        include: {
                                            AvailableAction: true
                                        }
                                    }
                                }
                            }
                        }
                    });
                    if (!zapRunDetails) {
                        return;
                    }
                    // rather than recursive pattern above , i can : 
                    // 1) send a query to get back the zap id 
                    // 2) send a query to get back the actions associated to this zap
                    // 3) find the available actions
                    const currentAction = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.Action.find(x => x.sortingOrder === stage);
                    if (!currentAction) {
                        console.log("current Action not found, maybe end of workflow?");
                        return;
                    }
                    const zapRunMetadata = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.metadata;
                    if (currentAction.AvailableAction.name === "email") {
                        const body = (0, parser_1.parse)((_c = currentAction.metadata) === null || _c === void 0 ? void 0 : _c.body, zapRunMetadata);
                        const to = (0, parser_1.parse)((_d = currentAction.metadata) === null || _d === void 0 ? void 0 : _d.email, zapRunMetadata);
                        console.log(`sending out Email to ${to} body is ${body}`);
                        yield (0, email_1.sendEmail)(to, body, zapRunMetadata);
                    }
                    if (currentAction.AvailableAction.name === "upi") {
                        const amount = (0, parser_1.parse)((_e = currentAction.metadata) === null || _e === void 0 ? void 0 : _e.amount, zapRunMetadata);
                        const address = (0, parser_1.parse)((_f = currentAction.metadata) === null || _f === void 0 ? void 0 : _f.address, zapRunMetadata);
                        console.log(`Sending out upi of ${amount} to address ${address}`);
                        yield (0, upi_1.sendUpi)(address, amount);
                    }
                    if (currentAction.AvailableAction.id === "ai-parser") {
                        console.log("executing ai parser...");
                        const aiResult = yield runAiParser(currentAction.metadata, zapRunMetadata);
                        const newMetadata = Object.assign(Object.assign({}, zapRunMetadata), aiResult);
                        yield prismaClient.zapRun.update({
                            where: {
                                id: zapRunId
                            },
                            data: {
                                metadata: newMetadata
                            }
                        });
                        console.log("AI Data saved to DB");
                    }
                    yield new Promise(r => setTimeout(r, 5000));
                    const lastStage = (((_g = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.Action) === null || _g === void 0 ? void 0 : _g.length) || 1) - 1;
                    if (lastStage !== stage) {
                        console.log(`pushing next stage (${stage + 1}) to Kafka`);
                        yield producer.send({
                            topic: TOPIC_NAME,
                            messages: [{
                                    value: JSON.stringify({
                                        stage: stage + 1,
                                        zapRunId
                                    })
                                }]
                        });
                    }
                    else {
                        console.log("workflow completed");
                    }
                    yield consumer.commitOffsets([{
                            topic: TOPIC_NAME,
                            partition: partition,
                            offset: (parseInt(message.offset) + 1).toString()
                        }]);
                }
                catch (error) {
                    console.error("processing failed:", error);
                }
            }),
        });
    });
}
main();
