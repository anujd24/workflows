"use client";

import { Appbar } from "@/components/Appbar";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND__URL, HOOKS_URL } from "../../config";
import { useRouter } from "next/navigation";
import { ArrowDown, Check, Copy, ExternalLink, Trash2, Zap as ZapIcon } from "lucide-react";

interface Zap {
  id: string;
  triggerId: string;
  userId: number;
  createdAt : string
  Action: {
    id: string;
    zapId: string;
    actionId: string;
    sortingOrder: number;
    AvailableAction: {
      id: string;
      name: string;
      image: string;
    };
  }[];
  trigger: {
    id: string;
    zapId: string;
    triggerId: string;
    type: {
      id: string;
      name: string;
      image: string;
    };
  };
}

export default function ZapDetailsPage({ params }: { params: { zapId: string } }) {
  const router = useRouter();
  const [zap, setZap] = useState<Zap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    axios.get(`${BACKEND__URL}/api/v1/zap`, {
        headers: { Authorization: localStorage.getItem("token") },
    })
    .then(res => {
        const foundZap = res.data.zaps.find((z: Zap) => String(z.id) === String(params.zapId));
        if (foundZap) {
            console.log("zap found", foundZap);
            setZap(foundZap);
        } else {
            console.error("zap not found");
        }
        setLoading(false);
    })
    .catch(e => {
        console.error("Fetching failed:", e);
        setLoading(false);
    });
  }, [params.zapId]);

  const handleDelete = async () => {
    if(!confirm("Are you sure you want to delete this Zap?")) return;
    
    try {
        alert("Deleted"); 
        router.push("/dashboard");
    } catch(e) {
        alert("Failed to delete");
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (!zap) return <div className="min-h-screen bg-slate-50"><Appbar /><div className="p-8 text-center">Zap not found</div></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Appbar />
      
      <main className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                <div onClick={() => router.back()} className="cursor-pointer p-2 bg-white border rounded-full hover:bg-slate-100">
                    ←
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Workflow Details</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono bg-slate-200 px-2 py-1 rounded text-slate-600">{zap.id}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Active</span>
                    </div>
                </div>
            </div>
            
            <button 
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors border border-red-200 font-medium text-sm"
            >
                <Trash2 className="w-4 h-4" />
                Delete Zap
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <img src={zap.trigger.type.image} className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">Trigger: {zap.trigger.type.name}</h3>
                            <p className="text-sm text-slate-500 mt-1">Whenever a new event is received via Webhook.</p>
                        </div>
                    </div>
                    
                    <div className="mt-6 bg-slate-50 p-4 rounded-md border border-slate-200">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Webhook URL</label>
                        <WebhookDisplay zapId={zap.id} />
                    </div>
                </div>
                <div className="flex justify-center -my-2">
                    <ArrowDown className="text-slate-300 w-6 h-6" />
                </div>
                {zap.Action.map((action, index) => (
                    <div key={action.id}>
                        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 relative overflow-hidden group hover:border-purple-300 transition-all">
                             <div className="absolute top-0 left-0 w-1 h-full bg-slate-300 group-hover:bg-purple-500 transition-colors"></div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <img src={action.AvailableAction.image} className="w-8 h-8 object-contain" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">Action {index + 1}: {action.AvailableAction.name}</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Performs the configured action automatically.
                                    </p>
                                </div>
                            </div>
                        </div>
                        {index < zap.Action.length - 1 && (
                            <div className="flex justify-center -my-2 pt-6">
                                <ArrowDown className="text-slate-300 w-6 h-6" />
                            </div>
                        )}
                    </div>
                ))}
                
            </div>
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 mb-4">About this Zap</h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Created on</span>
                            <span className="font-medium">{new Date(zap.createdAt).toLocaleDateString(
                                "en-US", {
                                    year : "numeric",
                                    month :"short",
                                    day : "numeric"
                                }
                            )}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Total Runs</span>
                            <span className="font-medium">0</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Last Success</span>
                            <span className="font-medium text-slate-400">Never</span>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <button className="w-full py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 transition-colors text-sm font-medium">
                            View Run History
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}

function WebhookDisplay({ zapId }: { zapId: string }) {
    const [copied, setCopied] = useState(false);
    const url = `${HOOKS_URL}/hooks/catch/1/${zapId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex">
             <input 
                type="text" 
                readOnly 
                value={url} 
                className="flex-1 bg-white border border-slate-300 rounded-l-md px-3 py-2 text-sm text-slate-600 focus:outline-none font-mono"
            />
            <button 
                onClick={handleCopy}
                className="bg-slate-100 border border-l-0 border-slate-300 rounded-r-md px-4 hover:bg-slate-200 transition-colors flex items-center justify-center"
            >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
            </button>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Appbar />
            <div className="max-w-4xl mx-auto p-8 space-y-8">
                <div className="h-10 w-1/3 bg-slate-200 rounded animate-pulse mb-8"></div>
                <div className="bg-white h-48 rounded-lg shadow-sm animate-pulse"></div>
                <div className="bg-white h-24 rounded-lg shadow-sm animate-pulse"></div>
                <div className="bg-white h-24 rounded-lg shadow-sm animate-pulse"></div>
            </div>
        </div>
    )
}