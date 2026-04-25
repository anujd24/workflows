import { Router } from "express";
import { authMiddleware } from "../middleware";
import { ZapCreateSchema } from "../types";
import { prismaClient } from "../db";

const router = Router();

router.post("/", authMiddleware, async (req, res) => {
    //@ts-ignore
    const id: string = req.id;
    const body = req.body;
    const parsedData = ZapCreateSchema.safeParse(body);

    if (!parsedData.success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        });
    }

    const userId = parseInt(id);
    console.log("[ZAP CREATE] userId:", userId, "| raw id from JWT:", id);
    console.log("[ZAP CREATE] parsed payload:", JSON.stringify(parsedData.data, null, 2));

    if (isNaN(userId)) {
        console.error("[ZAP CREATE] userId is NaN, JWT id was:", id);
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
        const zapId = await prismaClient.$transaction(async tx => {
            console.log("[ZAP CREATE] Creating zap record...");
            const zap = await tx.zap.create({
                data: {
                    userId,
                    triggerId: "",
                    Action: {
                        create: parsedData.data.actions.map((x, index) => ({
                            actionId: x.availableActionId,
                            sortingOrder: index,
                            metadata: x.actionMetadata || {}
                        }))
                    }
                }
            });
            console.log("[ZAP CREATE] Zap created:", zap.id);

            console.log("[ZAP CREATE] Creating trigger with triggerId:", parsedData.data.availableTriggerId);
            const trigger = await tx.trigger.create({
                data: {
                    triggerId: parsedData.data.availableTriggerId,
                    zapId: zap.id
                }
            });
            console.log("[ZAP CREATE] Trigger created:", trigger.id);

            await tx.zap.update({
                where: {
                    id: zap.id
                },
                data: {
                    triggerId: trigger.id
                }
            });
            console.log("[ZAP CREATE] Zap updated with trigger ID");

            return zap.id;
        });

        return res.json({
            zapId
        });
    } catch (e: any) {
        console.error("[ZAP CREATE] Error:", e.message);
        console.error("[ZAP CREATE] Full error:", e);
        return res.status(500).json({
            message: "Internal server error",
            error: e.message
        });
    }
})

router.get("/", authMiddleware, async(req,res)=>{
    //@ts-ignore
    const id = req.id;
    const zaps = await prismaClient.zap.findMany({
        where :{
            userId : parseInt(id)
        }, 
        include : {
            Action : {
                include : {
                    AvailableAction : true 
                }
            },
            trigger : {
                include : {
                    type : true
                }
            }
        }
    })
    return res.json({
        zaps
    })
})

router.get("/:zapId", authMiddleware, async(req,res)=>{
    //@ts-ignore
    const id = req.id;
    const zapId = req.params.zapId;
    const zaps = await prismaClient.zap.findFirst({
        where :{
            id : zapId,
            userId : parseInt(id)
        }, 
        include : {
            Action : {
                include : {
                    AvailableAction : true 
                }
            },
            trigger : {
                include : {
                    type : true
                }
            }
        }
    })
    return res.json({
        zaps
    })
})

export const zapRouter = router;