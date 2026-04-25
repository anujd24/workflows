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
exports.zapRouter = void 0;
const express_1 = require("express");
const middleware_1 = require("../middleware");
const types_1 = require("../types");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.post("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const id = req.id;
    const body = req.body;
    const parsedData = types_1.ZapCreateSchema.safeParse(body);
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
        const zapId = yield db_1.prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            console.log("[ZAP CREATE] Creating zap record...");
            const zap = yield tx.zap.create({
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
            const trigger = yield tx.trigger.create({
                data: {
                    triggerId: parsedData.data.availableTriggerId,
                    zapId: zap.id
                }
            });
            console.log("[ZAP CREATE] Trigger created:", trigger.id);
            yield tx.zap.update({
                where: {
                    id: zap.id
                },
                data: {
                    triggerId: trigger.id
                }
            });
            console.log("[ZAP CREATE] Zap updated with trigger ID");
            return zap.id;
        }));
        return res.json({
            zapId
        });
    }
    catch (e) {
        console.error("[ZAP CREATE] Error:", e.message);
        console.error("[ZAP CREATE] Full error:", e);
        return res.status(500).json({
            message: "Internal server error",
            error: e.message
        });
    }
}));
router.get("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const id = req.id;
    const zaps = yield db_1.prismaClient.zap.findMany({
        where: {
            userId: parseInt(id)
        },
        include: {
            Action: {
                include: {
                    AvailableAction: true
                }
            },
            trigger: {
                include: {
                    type: true
                }
            }
        }
    });
    return res.json({
        zaps
    });
}));
router.get("/:zapId", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const id = req.id;
    const zapId = req.params.zapId;
    const zaps = yield db_1.prismaClient.zap.findFirst({
        where: {
            id: zapId,
            userId: parseInt(id)
        },
        include: {
            Action: {
                include: {
                    AvailableAction: true
                }
            },
            trigger: {
                include: {
                    type: true
                }
            }
        }
    });
    return res.json({
        zaps
    });
}));
exports.zapRouter = router;
