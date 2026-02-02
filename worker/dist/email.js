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
function sendEmail(to, body, bindings) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("metadata received:", JSON.stringify(bindings, null, 2));
        const finalEmail = (0, parser_1.parse)(to, bindings);
        const finalBody = (0, parser_1.parse)(body, bindings);
        console.log(`parsing '${to}' and result is: '${finalEmail}'`);
        if (!finalEmail || finalEmail.includes("{") || finalEmail.trim() === "") {
            return;
        }
        const transport = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
            },
        });
        try {
            yield transport.sendMail({
                from: process.env.SMTP_USERNAME,
                to: finalEmail,
                subject: "ZapFlux",
                text: finalBody,
            });
            console.log("email sent successfully to", finalEmail);
        }
        catch (e) {
            console.error(" nodemailer Error:", e);
        }
    });
}
