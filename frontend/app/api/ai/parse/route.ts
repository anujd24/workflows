import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: NextRequest) {
    if (!apiKey) {
        return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    try {
        const body = await req.json();
        
        const textToProcess = body.text; 
        const fieldsToExtract = body.fields; 

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const systemPrompt = `
            You are an advanced Data Extraction AI.
            Your task is to extract specific information from the provided text.

            Fields to extract: ${JSON.stringify(fieldsToExtract)}
            
            Input Text: "${textToProcess}"

            Rules:
            1. Return ONLY a valid JSON object.
            2. The keys of the JSON must match the "Fields to extract" list exactly.
            3. If a field is not found in the text, set its value to null.
            4. Do NOT add markdown formatting (like \`\`\`json). Just raw JSON.
            5. Convert numbers to actual numbers (e.g., "500" -> 500), not strings.
        `;

        const result = await model.generateContent(systemPrompt);
        const response = result.response;
        let text = response.text();
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsedData = JSON.parse(text);
        return NextResponse.json({ result: parsedData });

    } catch (e: any) {
        console.error("parser error:", e);
        return NextResponse.json({ error: "failed to parse data" }, { status: 500 });
    }
}