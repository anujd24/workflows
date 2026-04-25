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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const kafkajs_1 = require("kafkajs");
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const server = http_1.default.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Processor is running fine!');
});
const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`server listening on port ${port}`);
});
const TOPIC_NAME = "zap-events";
const client = new client_1.PrismaClient;
const kafka = new kafkajs_1.Kafka({
    clientId: 'outbox-processor',
    brokers: ["localhost:9092"],
    // ssl: {
    //     ca : [Ca_Cert.replace(/\\r\\n/g, "\\n")],
    //     rejectUnauthorized : true,
    //     checkServerIdentity : () => undefined
    // },
    // sasl: {
    //     mechanism: 'scram-sha-256', 
    //     username: process.env.KAFKA_USERNAME || "",
    //     password: process.env.KAFKA_PASSWORD || "",
    // }
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const producer = kafka.producer();
        try {
            yield producer.connect();
            console.log("kafka connected");
        }
        catch (e) {
            console.error("kafka connection failed : ", e);
            process.exit(1);
        }
        while (1) {
            const pendingRows = yield client.zapRunOutbox.findMany({
                where: {},
                take: 10
            });
            console.log(pendingRows);
            if (pendingRows.length === 0) {
                console.log("queue empty, sleeping for 3 seconds.");
                yield new Promise(r => setTimeout(r, 3000));
                continue; // again go at the start of the loop
            }
            try {
                console.log(`processing ${pendingRows.length} events`);
                producer.send({
                    topic: TOPIC_NAME,
                    messages: pendingRows.map(r => {
                        return {
                            value: JSON.stringify({ zapRunId: r.zapRunId, stage: 0 })
                        };
                    })
                });
                yield client.zapRunOutbox.deleteMany({
                    where: {
                        id: {
                            in: pendingRows.map(x => x.id)
                        }
                    }
                });
            }
            catch (error) {
                console.error("Error sending batch to Kafka:", error);
                yield new Promise(r => setTimeout(r, 2000));
            }
        }
    });
}
main();
