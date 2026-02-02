import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const METADATA = `
Available Triggers:
- ID: "6b9c7919-ae73-4e20-a17d-6bff3f0ec8da" (Name: Webhook) 
- ID: "email" (Name: Email)
- ID: "upi" (Name: UPI)

Available Actions:
- ID: "email" (Name: Email)
- ID: "upi" (Name: UPI)
- ID: "webhook" (Name: Webhook Action)
- ID: "ai-parser" (Name: AI Data Extraction / Parser)
`;

export async function POST(req: NextRequest) {
    const body = await req.json();
    const userPrompt = body.prompt;

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const systemPrompt = `
        You are an AI automation architect. 
        Your task is to convert the user's request into a JSON workflow.
        
        Here are the available tools:
        ${METADATA}

        Rules:
        1. You must ONLY return a valid JSON object. Do not add markdown or text.
        2. The JSON must have a "trigger" object and an "actions" array.
        3. Use ONLY the IDs provided in the list above.

        Example User Input: "Send me an email when I get a webhook"
        Example Output:
        {
            "trigger": { "id": "webhook", "label": "Webhook" },
            "actions": [
                { "id": "email-send", "label": "Send Email" }
            ]
        }
    `;

    try {
        const result = await model.generateContent(`${systemPrompt}\n\nUser Request: ${userPrompt}`);
        const response = result.response;
        let text = response.text();

        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return NextResponse.json({ result: JSON.parse(text) });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "failed to generate workflow" }, { status: 500 });
    }
}