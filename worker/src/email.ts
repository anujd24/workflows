import nodemailer from "nodemailer";
import {parse} from "./parser"
import SMTPConnection from "nodemailer/lib/smtp-connection";


export async function sendEmail(to: string, body: string, bindings: any) {
    
    console.log("metadata received:", JSON.stringify(bindings, null, 2));

    const finalEmail = parse(to, bindings);
    const finalBody = parse(body, bindings);

    console.log(`parsing '${to}' and result is: '${finalEmail}'`);
    
    if (!finalEmail || finalEmail.includes("{") || finalEmail.trim() === "") {
        return; 
    }

    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: 465,
        secure: true, 
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    try {
        await transport.sendMail({
            from: process.env.SMTP_USERNAME, 
            to: finalEmail,
            subject: "ZapFlux", 
            text: finalBody,
        });
        console.log("email sent successfully to", finalEmail);
    } catch (e) {
        console.error(" nodemailer Error:", e);
    }
}