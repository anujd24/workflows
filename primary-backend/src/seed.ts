
import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();

async function main(){
    await prismaClient.availableTrigger.create({
        data : {
            id : "webhook",
            name  : "Webhook",
            image : "https://img.icons8.com/color/1200/webhook.jpg"
        }
    })

    await prismaClient.availableAction.create({
        data : {
            id: "upi",
            name : "UPI",
            image : "https://t3.ftcdn.net/jpg/05/60/50/16/360_F_560501607_x7crxqBWbmbgK2k8zOL0gICbIbK9hP6y.jpg"
        }
    })

    await prismaClient.availableAction.create({
        data : {
            id: "email",
            name : "Email",
            image : "https://cdn.pixabay.com/photo/2016/01/26/17/15/gmail-1162901_1280.png"
        }
    })
}

main();