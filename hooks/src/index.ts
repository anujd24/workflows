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
        console.error("Webhook Error:", error);
        res.status(411).json({
            message: "Error while storing webhook. Check Zap ID."
        });
    }
    
});

app.listen(3002);