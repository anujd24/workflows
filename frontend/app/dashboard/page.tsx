"use client";

import { Appbar } from "@/components/Appbar";
import { DarkButton } from "@/components/buttons/DarkButton";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND__URL, HOOKS_URL } from "../config";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Copy, Link, Trash2, Zap as ZapIcon } from "lucide-react";

interface Zap {
  id: string;
  triggerId: string;
  userId: number;
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

function useZaps() {
  const [loading, setLoading] = useState(true);
  const [zaps, setZaps] = useState<Zap[]>([]);

  useEffect(() => {
    axios
      .get(`${BACKEND__URL}/api/v1/zap`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => {
        setZaps(res.data.zaps);
        setLoading(false);
      })
      .catch(e => {
        setLoading(false);
      })
  }, []);

  return { loading, zaps };
}

export default function Dashboard() {
  const { loading, zaps } = useZaps();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50">
      <Appbar />
      <div className="flex justify-center pt-8 pb-8">
        <div className="max-w-screen-lg w-full px-4 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Workflows</h1>
              <p className="text-slate-500 mt-1">Manage and track your automations.</p>
            </div>
            <DarkButton onClick={() => router.push("/zap/create")}>
              <div className="flex items-center gap-2">
                <span>+</span>
                <span>Create Zap</span>
              </div>
            </DarkButton>
          </div>
          {loading ? (
            <div className="space-y-4">
               {[1, 2, 3].map(i => <div key={i} className="h-24 w-full bg-white rounded-lg shadow-sm animate-pulse"></div>)}
            </div>
          ) : zaps.length === 0 ? (
            <EmptyState router={router} />
          ) : (
            <div className="grid gap-4">
              {zaps.map((zap) => (
                <ZapRow key={zap.id} zap={zap} router={router} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ZapRow({ zap, router }: { zap: Zap; router: any }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center p-2">
             <img src={zap.trigger.type.image} alt="Trigger" className="w-full h-full object-contain" />
          </div>
          {zap.Action.map((action) => (
            <div key={action.id} className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center p-2 border border-slate-200">
                <img src={action.AvailableAction.image} alt="Action" className="w-full h-full object-contain" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="ml-4 hidden sm:block">
            <h3 className="font-semibold text-slate-800">Untitled Workflow</h3>
            <p className="text-xs text-slate-400">ID: {zap.id}</p>
        </div>
      </div>

      <div className="flex-1 w-full sm:w-auto">
        <WebhookUrlSelector zapId={zap.id} />
      </div>

      <div className="flex items-center gap-4">
        <button 
            onClick={() => router.push("/zap/" + zap.id)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
        >
            View Details
        </button>
      </div>
    </div>
  );
}

function WebhookUrlSelector({ zapId }: { zapId: string }) {
    const [copied, setCopied] = useState(false);
    const url = `${HOOKS_URL}/hooks/catch/1/${zapId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-md border border-slate-200 max-w-sm w-full">
            <div className="flex-1 truncate text-xs text-slate-600 font-mono">
                {url}
            </div>
            <button 
                onClick={handleCopy}
                className="p-1 hover:bg-slate-200 rounded transition-colors"
                title="Copy Webhook URL"
            >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
            </button>
        </div>
    );
}

function EmptyState({ router }: { router: any }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-300 rounded-xl">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <ZapIcon className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No Zaps created yet</h3>
            <p className="text-slate-500 mb-6 text-center max-w-sm">
                Create your first automated workflow to connect your apps and save time.
            </p>
            <DarkButton onClick={() => router.push("/zap/create")}>
                Create your first Zap
            </DarkButton>
        </div>
    )
}