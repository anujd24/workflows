import { useState } from "react";
import axios from "axios";
import { X, Sparkles, Loader2 } from "lucide-react";
import { PrimaryButton } from "./buttons/PrimaryButton";

interface AiModalProps {
    onClose: () => void;
    onGenerate: (data: any) => void;
}

export const AiModal = ({ onClose, onGenerate }: AiModalProps) => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt) return;
        setLoading(true);
        try {
            const res = await axios.post("/api/ai/generate", { prompt });
            onGenerate(res.data.result); 
            onClose();
        } catch (e) {
            alert("AI could not generate workflow. Try being more specific.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-purple-600 p-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        <h2 className="text-xl font-bold">Describe your Workflow</h2>
                    </div>
                    <button onClick={onClose} className="hover:bg-purple-700 p-1 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., When I receive a webhook, send an email to my boss and update the google sheet."
                        className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-slate-800 placeholder:text-slate-400"
                    />
                    
                    <div className="mt-6 flex justify-end">
                        <PrimaryButton onClick={handleGenerate} size="big">
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Generate Draft
                                </div>
                            )}
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </div>
    );
};