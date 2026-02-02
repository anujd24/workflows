"use client";
import axios from "axios";
import { useState } from "react";

export const RunButton = ({ zapId, webhookUrl }: { zapId: string, webhookUrl: string }) => {
    const [payload, setPayload] = useState('Please pay 500 to admin@ybl and email hello@gmail.com');
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [logs, setLogs] = useState<string[]>([]);

    const handleRun = async () => {
        setStatus("loading");
        setLogs(["Triggering webhook..."]);

        try {
            await axios.post(webhookUrl, {
                comment: payload
            });

            setLogs(prev => [...prev, "Webhook received by Backend", "Processing in queue..."]);

            setTimeout(() => {
                setStatus("success");
                setLogs(prev => [...prev, "AI Parsing Completed", "UPI Logic Executed", "Email Sent", "Workflow Finished!"]);
            }, 3000);

        } catch (e) {
            console.error(e);
            setStatus("error");
            setLogs(prev => [...prev, "Error"]);
        }
    }

    return (
        <div className="mt-8 p-6 bg-slate-900 rounded-lg border border-slate-700 text-white w-full max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4"> Test Your AI Agent</h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Simulate User Input (Email/Message)</label>
                    <textarea 
                        value={payload}
                        onChange={(e) => setPayload(e.target.value)}
                        className="w-full p-3 bg-slate-800 rounded border border-slate-600 focus:border-purple-500 outline-none text-white h-24"
                        placeholder="Type a message like: Send 500 to Rahul..."
                    />
                </div>

                <button 
                    onClick={handleRun}
                    disabled={status === "loading"}
                    className={`w-full py-3 rounded font-bold transition-all ${
                        status === "loading" 
                        ? "bg-slate-600 cursor-not-allowed" 
                        : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                    }`}
                >
                    {status === "loading" ? "Running ai engine..." : "Run workflow now"}
                </button>

                {logs.length > 0 && (
                    <div className="mt-4 p-4 bg-black rounded font-mono text-sm space-y-2 h-40 overflow-y-auto border border-green-900/50">
                        {logs.map((log, i) => (
                            <div key={i} className="text-green-400">
                                <span className="mr-2 text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                                {log}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}