import { Router } from "express";
import { authMiddleware } from "../middleware";
import { SigninSchema, SignupSchema } from "../types";
import { prismaClient } from "../db";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";

const router = Router();

router.post("/signup", async(req,res)=>{
    const body = req.body;
    const parsedData = SignupSchema.safeParse(body);

    if(!parsedData.success){
        return res.status(411).json({
            message : "Incorrect inputs"
        })
    }

    try {
        const userExists = await prismaClient.user.findFirst({
            where:{
                email: parsedData.data.username
            }
        });

        if(userExists){
            return res.status(403).json({
                message : "User already exists"
            })
        }

        await prismaClient.user.create({
            data:{
                email : parsedData.data.username,
                password : parsedData.data.password,
                name : parsedData.data.name
            }
        });

        return res.json({
            message : "Please verify your account by checking your email"
        })
    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).json({
            message : "Internal server error during signup"
        });
    }
})

router.post("/signin", async(req,res)=>{
    const body = req.body;
    const parsedData = SigninSchema.safeParse(body);

    if(!parsedData.success){
        return res.status(411).json({
            message : "Incorrect inputs"
        })
    }

    try {
        const user = await prismaClient.user.findFirst({
            where:{
                email: parsedData.data.username,
                password : parsedData.data.password
            }
        });

        if(!user){
            return res.status(403).json({
                message : "Sorry credentials are incorrect"
            })
        }

        const token = jwt.sign({
            id : user.id,
        }, JWT_PASSWORD); 

        res.json({
            token : token,
        });
    } catch (error) {
        console.error("Error during signin:", error);
        return res.status(500).json({
            message: "Internal server error during signin"
        });
    }
})

router.get("/", authMiddleware, async(req,res)=>{
    // @ts-ignore
    const id = req.id;
    try {
        const user = await prismaClient.user.findFirst({
            where:{
                id
            },
            select : {
                name : true,
                email : true
            }
        });
        return res.json({
            user
        })
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
})

export const userRouter = router;