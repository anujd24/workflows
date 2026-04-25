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
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const parser_1 = require("./parser");
let transport = null;
function getTransport() {
    if (transport)
        return transport;
    const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").replace(/"/g, "").trim();
    const smtpPort = parseInt((process.env.SMTP_PORT || "587").replace(/"/g, "").trim());
    const username = (process.env.SMTP_USERNAME || "").replace(/"/g, "").trim();
    const password = (process.env.SMTP_PASSWORD || "").replace(/"/g, "").trim();
    const config = {
        auth: {
            user: username,
            pass: password,
        },
        logger: true, // Log to console
        debug: true, // Include SMTP traffic in logs
    };
    // Gmail optimization
    if (smtpHost.includes("gmail.com")) {
        config.service = "gmail";
    }
    else {
        config.host = smtpHost;
        config.port = smtpPort;
        config.secure = smtpPort === 465;
    }
    config.tls = {
        rejectUnauthorized: false // Helps with some SMTP servers
    };
    transport = nodemailer_1.default.createTransport(config);
    return transport;
}
function sendEmail(to, body, bindings) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("[Email Service] Processing email for:", to);
        // Final check for placeholders
        const finalEmail = (0, parser_1.parse)(to, bindings).trim();
        const finalBody = (0, parser_1.parse)(body, bindings);
        if (!finalEmail || finalEmail.includes("{") || finalEmail.trim() === "") {
            console.error("[Email Service] Stopped: Invalid or unparsed email address:", finalEmail);
            return;
        }
        const transporter = getTransport();
        const fromEmail = (process.env.SMTP_USERNAME || "").replace(/"/g, "").trim();
        try {
            yield transporter.sendMail({
                from: `"ZapFlux" <${fromEmail}>`,
                to: finalEmail,
                subject: "ZapFlux Notification",
                text: finalBody,
            });
            console.log("[Email Service] Success: Email sent to", finalEmail);
        }
        catch (e) {
            console.error("[Email Service] Error sending mail:", e);
        }
    });
}
