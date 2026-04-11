import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, body: string, bindings: any) {
    console.log("[Email Service] Sending to:", to);

    if (!to || to.includes("{") || to.trim() === "") {
        console.error("[Email Service] Invalid email:", to);
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: "ZapFlux <onboarding@resend.dev>", // free tier mein ye use karo
            to: to,
            subject: "ZapFlux Notification",
            text: body,
        });

        if (error) {
            console.error("[Email Service] Resend error:", error);
            return;
        }

        console.log("[Email Service] Email sent successfully!", data);
    } catch (e) {
        console.error("[Email Service] Error:", e);
    }
}