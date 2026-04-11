import nodemailer from "nodemailer";
import { parse } from "./parser";

let transport: any = null;

function getTransport() {
    if (transport) return transport;

    const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").replace(/"/g, "").trim();
    const smtpPort = parseInt((process.env.SMTP_PORT || "587").replace(/"/g, "").trim());
    const username = (process.env.SMTP_USERNAME || "").replace(/"/g, "").trim();
    const password = (process.env.SMTP_PASSWORD || "").replace(/"/g, "").trim();

    // Debug log to check what variables are being read
    console.log(`[Email Service] Config: Host=${smtpHost}, Port=${smtpPort}, User=${username}`);

    const config: any = {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // Use SSL for port 465
        auth: {
            user: username,
            pass: password,
        },
        tls: {
            rejectUnauthorized: false // Helps bypass some local network restrictions
        },
        logger: true,
        debug: true,
    };

    transport = nodemailer.createTransport(config);
    return transport;
}

export async function sendEmail(to: string, body: string, bindings: any) {
    console.log("[Email Service] Processing email for:", to);

    const finalEmail = parse(to, bindings).trim();
    const finalBody = parse(body, bindings);

    if (!finalEmail || finalEmail.includes("{") || finalEmail.trim() === "") {
        console.error("[Email Service] Stopped: Invalid or unparsed email address:", finalEmail);
        return; 
    }

    const transporter = getTransport();
    const fromEmail = (process.env.SMTP_USERNAME || "").replace(/"/g, "").trim();

    try {
        await transporter.sendMail({
            from: `"ZapFlux" <${fromEmail}>`, 
            to: finalEmail,
            subject: "ZapFlux Notification", 
            text: finalBody,
        });
        console.log("[Email Service] Success: Email sent to", finalEmail);
    } catch (e) {
        console.error("[Email Service] Error sending mail:", e);
    }
}