"use client";

import { BACKEND__URL, HOOKS_URL} from "@/app/config";
import { Appbar } from "@/components/Appbar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { Input } from "@/components/Input";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import ReactFlow, { 
    Background, 
    Controls, 
    Node, 
    Edge, 
    useNodesState, 
    useEdgesState,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css'; 
import CustomNode from "@/components/CustomNode"; 
import { AiModal } from "@/components/AiModal"; 
import { Sparkles, X, CheckCircle, Terminal } from "lucide-react"; 

const nodeTypes = {
    custom: CustomNode,
};

// Hook to fetch actions/triggers
function useAvailableActionsAndTriggers() {
    const [availableActions, setAvailableActions] = useState<any[]>([]);
    const [availableTriggers, setAvailableTriggers] = useState<any[]>([]);

    useEffect(() => {
        axios.get(`${BACKEND__URL}/api/v1/trigger/available`)
            .then(x => setAvailableTriggers(x.data.availableTriggers));

        axios.get(`${BACKEND__URL}/api/v1/action/available`)
            .then(x => setAvailableActions(x.data.availableActions));
    }, []);

    return { availableActions, availableTriggers };
}

export default function ZapBuilder() {
    const router = useRouter();
    const { availableActions, availableTriggers } = useAvailableActionsAndTriggers();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false); 
    
    const [publishedZapUrl, setPublishedZapUrl] = useState<string | null>(null);

    useEffect(() => {
        setNodes([
            {
                id: 'trigger-1',
                type: 'custom',
                position: { x: 250, y: 50 },
                data: { 
                    label: 'Select Trigger', 
                    isTrigger: true,
                    onClick: () => setSelectedNodeId('trigger-1') 
                }
            }
        ]);
    }, []);

    const handleAiGeneration = (aiData: any) => {
        const matchedTrigger = availableTriggers.find(t => t.id === aiData.trigger.id);
        
        const newTriggerNode: Node = {
            id: 'trigger-1',
            type: 'custom',
            position: { x: 250, y: 50 },
            data: {
                label: matchedTrigger ? matchedTrigger.name : aiData.trigger.label,
                isTrigger: true,
                icon: matchedTrigger?.image,
                metadata: matchedTrigger,    
                onClick: () => setSelectedNodeId('trigger-1')
            }
        };

        const newNodes = [newTriggerNode];
        const newEdges: Edge[] = [];
        let currentY = 200; 
        let parentId = 'trigger-1';

        aiData.actions.forEach((action: any, index: number) => {
            const matchedAction = availableActions.find(a => a.id === action.id);
            const nodeId = `action-${index}`;

            newNodes.push({
                id: nodeId,
                type: 'custom',
                position: { x: 250, y: currentY },
                data: {
                    label: matchedAction ? matchedAction.name : action.label,
                    isTrigger: false,
                    icon: matchedAction?.image,
                    metadata: matchedAction,
                    onClick: () => setSelectedNodeId(nodeId)
                }
            });

            newEdges.push({
                id: `e-${parentId}-${nodeId}`,
                source: parentId,
                target: nodeId,
                markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
                style: { stroke: '#6366f1', strokeWidth: 2 }
            });

            parentId = nodeId;
            currentY += 150;
        });

        setNodes(newNodes);
        setEdges(newEdges);
        setIsAiModalOpen(false); 
    };

    const addNewAction = useCallback(() => {
        const newId = `action-${nodes.length}`;
        const lastNode = nodes[nodes.length - 1];
        
        const newNode: Node = {
            id: newId,
            type: 'custom',
            position: { x: lastNode.position.x, y: lastNode.position.y + 150 },
            data: { 
                label: 'Select Action', 
                isTrigger: false,
                onClick: () => setSelectedNodeId(newId) 
            }
        };

        const newEdge: Edge = {
            id: `e-${lastNode.id}-${newId}`,
            source: lastNode.id,
            target: newId,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
            style: { stroke: '#6366f1', strokeWidth: 2 }
        };

        setNodes((nds) => [...nds, newNode]);
        setEdges((eds) => [...eds, newEdge]);
    }, [nodes]);

    const onPublish = async () => {
        const triggerNode = nodes.find(n => n.id === 'trigger-1');
        const actionNodes = nodes.filter(n => n.id.startsWith('action'));

        console.log(" checking trigger node:", triggerNode);

        if (!triggerNode?.data.metadata?.id) {
            alert("trigger not selected, select from sidebar");
            return;
        }

        console.log("trigger found:", triggerNode.data.metadata.id);

        const payload = {
            availableTriggerId: triggerNode.data.metadata.id,
            triggeredMetadata: {}, 
            actions: actionNodes.map(n => ({
                availableActionId: n.data.metadata?.id,
                actionMetadata: n.data.actionMetadata || {}
            }))
        };
        
        console.log("sending payload:", payload);

        try {
            const response = await axios.post(`${BACKEND__URL}/api/v1/zap`, payload, {
                headers: { Authorization: localStorage.getItem("token") }
            });
            
            console.log("backend response:", response.data);

            const newZapId = response.data.zapId || response.data.id; 

            if (!newZapId) {
                alert("zap created but id not found, check console.");
                return;
            }

            const webhookUrl = `${HOOKS_URL}/hooks/catch/1/${newZapId}`;
            console.log("🔗 Generated Webhook URL:", webhookUrl);
            
            setPublishedZapUrl(webhookUrl); 

        } catch (e: any) {
            console.error("publish error:", e);
            alert(`publish failed: ${e.response?.data?.message || e.message}`);
        }
    };
    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <Appbar />
            {isAiModalOpen && (
                <AiModal 
                    onClose={() => setIsAiModalOpen(false)} 
                    onGenerate={handleAiGeneration} 
                />
            )}
            {publishedZapUrl && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-purple-500 overflow-hidden">
                        <div className="bg-purple-600 p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-6 h-6 text-green-300" />
                                <h2 className="text-xl font-bold">Zap Published!</h2>
                            </div>
                            <button onClick={() => {
                                setPublishedZapUrl(null);
                                router.push("/dashboard");
                            }} className="hover:bg-purple-700 p-1 rounded"><X className="w-5 h-5"/></button>
                        </div>
                        
                        <div className="p-6">
                            <p className="text-gray-600 mb-6">
                                Your AI Agent is live! Test it right now using the simulator below.
                            </p>
                            
                            {/* Simulator Component */}
                            <RunButton webhookUrl={publishedZapUrl} />
                            
                            <div className="mt-6 flex justify-end gap-2">
                                <button 
                                    onClick={() => router.push("/dashboard")}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium"
                                >
                                    Close
                                </button>
                                <PrimaryButton onClick={() => router.push("/dashboard")}>
                                    Go to Dashboard
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 flex relative">
                <div className="flex-1 bg-slate-100 relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes} 
                        fitView
                        attributionPosition="bottom-left"
                    >
                        <Background color="#94a3b8" gap={20} />
                        <Controls />
                    </ReactFlow>
                    
                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                        <PrimaryButton onClick={addNewAction}>+ Add Step</PrimaryButton>
                        <button 
                            onClick={() => setIsAiModalOpen(true)}
                            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700 transition-all font-medium animate-pulse"
                        >
                            <Sparkles className="w-4 h-4" />
                            AI Build
                        </button>
                    </div>

                    <div className="absolute top-4 right-4 z-10">
                        <PrimaryButton onClick={onPublish}>Publish</PrimaryButton>
                    </div>
                </div>

                {/* 2. SIDEBAR CONFIGURATION */}
                {selectedNodeId && (
                    <div className="w-96 bg-white border-l shadow-2xl h-full p-6 absolute right-0 top-0 z-50 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Configure Step</h2>
                            <button onClick={() => setSelectedNodeId(null)} className="text-gray-500 hover:text-red-500"><X /></button>
                        </div>

                        <SidebarContent 
                            nodeId={selectedNodeId}
                            availableTriggers={availableTriggers}
                            availableActions={availableActions}
                            onUpdate={(data: any) => {
                                setNodes((nds) => nds.map((node) => {
                                    if (node.id === selectedNodeId) {
                                        return {
                                            ...node,
                                            data: { 
                                                ...node.data, 
                                                label: data.name, 
                                                icon: data.image,
                                                metadata: data 
                                            }
                                        };
                                    }
                                    return node;
                                }));
                            }}
                            onMetadataUpdate={(metadata: any) => {
                                setNodes((nds) => nds.map((node) => {
                                    if (node.id === selectedNodeId) {
                                        return {
                                            ...node,
                                            data: { ...node.data, actionMetadata: metadata }
                                        };
                                    }
                                    return node;
                                }));
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function RunButton({ webhookUrl }: { webhookUrl: string }) {
    const [payload, setPayload] = useState('Please pay 500 to admin@ybl and email hello@gmail.com');
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [logs, setLogs] = useState<string[]>([]);

    const handleRun = async () => {
        setStatus("loading");
        setLogs(["triggering webhook...", "connecting to backend..."]);
        
        try {
            console.log("hitting webhook url...", webhookUrl);
            console.log(" payload:", { comment: payload });

            const response = await axios.post(webhookUrl, { comment: payload });
            
            console.log("success response:", response.data);

            setTimeout(() => {
                setLogs(prev => [...prev, "webhook received by backend"]);
            }, 800);

            setTimeout(() => {
                setStatus("success");
                setLogs(prev => [...prev, " workflow completed!"]);
            }, 4500);

        } catch (e: any) {
            console.error("critical error:", e); 
            
            setStatus("error");
            const errorMessage = e.response?.data?.message || e.message || "Unknown Connection Error";
            setLogs(prev => [...prev, `error: ${errorMessage}`]);

            if (e.message === "Network Error") {
                console.warn("💡 HINT: Check if Backend (localhost:8080) is running? Check CORS?");
            }
        }
    }

    return (
        <div className="bg-slate-900 rounded-lg p-4 text-white font-mono text-sm border border-slate-700">
            <div className="flex items-center gap-2 mb-3 text-purple-400">
                <Terminal className="w-4 h-4" />
                <span>Test Simulator</span>
            </div>
            
            <div className="space-y-3">
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Input </label>
                    <textarea 
                        value={payload}
                        onChange={(e) => setPayload(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-green-400 focus:outline-none focus:border-purple-500 h-20 resize-none"
                    />
                </div>

                <button 
                    onClick={handleRun}
                    disabled={status === "loading"}
                    className={`w-full py-2 rounded font-bold transition-all ${
                        status === "loading" 
                        ? "bg-slate-700 cursor-wait" 
                        : "bg-green-600 hover:bg-green-500 text-black"
                    }`}
                >
                    {status === "loading" ? "Running..." : "Run"}
                </button>

                <div className="bg-black rounded p-3 h-32 overflow-y-auto border border-slate-800 shadow-inner">
                    {logs.length === 0 && <span className="text-slate-600 italic">Logs :</span>}
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1">
                            <span className="text-slate-500 mr-2">{">"}</span>
                            <span className={log.includes("error") ? "text-red-400" : "text-green-400"}>{log}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SidebarContent({ nodeId, availableTriggers, availableActions, onUpdate, onMetadataUpdate }: any) {
    const isTrigger = nodeId === 'trigger-1';
    const items = isTrigger ? availableTriggers : availableActions;
    const [step, setStep] = useState(0); 
    const [selectedItem, setSelectedItem] = useState<any>(null);

    return (
        <div className="space-y-4">
            {step === 0 ? (
                <div className="grid gap-2">
                    {items.map((item: any) => (
                        <div 
                            key={item.id}
                            className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-slate-100 transition-all"
                            onClick={() => {
                                setSelectedItem(item);
                                onUpdate(item);
                                setStep(1); 
                            }}
                        >
                            <img src={item.image} className="w-8 h-8 rounded-full object-cover" />
                            <span className="font-medium">{item.name}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    <button onClick={() => setStep(0)} className="text-sm text-blue-600 hover:underline">← Change Service</button>
                    
                    <div className="flex items-center gap-2 mb-4">
                        <img src={selectedItem.image} className="w-10 h-10 rounded-full" />
                        <div className="font-bold text-lg">{selectedItem.name}</div>
                    </div>
                    
                    {selectedItem.name === 'email' && <EmailSelector onChange={onMetadataUpdate} />}
                    {selectedItem.name === 'upi' && <UpiSelector onChange={onMetadataUpdate} />}
                    {selectedItem.id === 'ai-parser' && <ParserSelector onChange={onMetadataUpdate} />}
                </div>
            )}
        </div>
    );
}

function EmailSelector({ onChange }: { onChange: (data: any) => void }) {
    const [email, setEmail] = useState("");
    const [body, setBody] = useState("");

    useEffect(() => {
        onChange({ email, body });
    }, [email, body]);

    return (
        <div className="space-y-3">
            <Input label="To Email" type="text" placeholder="recipient@gmail.com" onChange={(e) => setEmail(e.target.value)} />
            <Input label="Body" type="text" placeholder="Hello world..." onChange={(e) => setBody(e.target.value)} />
        </div>
    );
}

function UpiSelector({ onChange }: { onChange: (data: any) => void }) {
    const [amount, setAmount] = useState("");
    const [address, setAddress] = useState("");

    useEffect(() => {
        onChange({ amount, address });
    }, [amount, address]);

    return (
        <div className="space-y-3">
            <Input label="Address" type="text" placeholder="user@upi" onChange={(e) => setAddress(e.target.value)} />
            <Input label="Amount" type="text" placeholder="100" onChange={(e) => setAmount(e.target.value)} />
        </div>
    );
}

function ParserSelector({ onChange }: { onChange: (data: any) => void }) {
    const [fields, setFields] = useState("");
    const [instructions, setInstructions] = useState("Extract fields from previous step"); 

    useEffect(() => {
        onChange({ 
            instructions, 
            fields: fields.split(",").map(f => f.trim()) 
        });
    }, [fields, instructions]);

    return (
        <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded text-sm text-purple-800">
                AI will extract structured data from unstructured text.
            </div>
            
            <Input 
                label="Input (Data to parse)" 
                type="text" 
                placeholder="Currently connects to previous step automatically" 
                onChange={(e) => setInstructions(e.target.value)} 
                value={instructions}
            />

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Fields to Extract (Comma separated)</label>
                <textarea 
                    className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-purple-500"
                    placeholder="amount, sender_name, date"
                    rows={3}
                    onChange={(e) => setFields(e.target.value)}
                />
                <p className="text-xs text-slate-500">Example: amount, email, order_id</p>
            </div>
        </div>
    );
}