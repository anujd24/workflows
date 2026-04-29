import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const client = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.post("/hooks/catch/:userId/:zapId", async(req, res) =>{
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const body = req.body;

    console.log(`[WEBHOOK RECEIVED] userId: ${userId}, zapId: ${zapId}`);

    try {
        await client.$transaction(async tx => {
            const run = await tx.zapRun.create({
                data: {
                    zapId : zapId,
                    metadata : body
                }
            });

            await tx.zapRunOutbox.create({
                data: {
                    zapRunId : run.id
                }
            })
        })
        res.json({
            message : "Webhook Received"
        })
    } catch(error){
        console.error("Webhook Storage Error Details:", error);
        res.status(411).json({
            message: "Error while storing webhook. Check Zap ID or DB connection.",
            error: error instanceof Error ? error.message : "Internal Database Error"
        });
    }
    
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Hooks service listening on port ${PORT}`);
});