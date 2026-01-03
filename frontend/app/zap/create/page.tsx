"use client";

import { BACKEND__URL } from "@/app/config";
import { Appbar } from "@/components/Appbar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { Input } from "@/components/Input";
import { ZapCell } from "@/components/ZapCell";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function useAvailableActionsAndTriggers(){
    const [ availableActions, setAvailableActions ] = useState([]);
    const [ availableTriggers, setAvailableTriggers ] = useState([]);

    useEffect(() => {
        axios.get(`${BACKEND__URL}/api/v1/trigger/available`)
            .then(x => setAvailableTriggers(x.data.availableTriggers))

         axios.get(`${BACKEND__URL}/api/v1/action/available`)
            .then(x => setAvailableActions(x.data.availableActions))

    }, [])
    return {
        availableActions,
        availableTriggers
    }
}

export default function() {
    const router = useRouter();

    const {availableActions, availableTriggers} = useAvailableActionsAndTriggers();
    
    const [selectedTrigger, setSelectedTrigger] = useState<{
        id:String;
        name:string;
    }>();
    const [selectedActions, setSelectedActions] = useState<{
        index : number;
        availableActionId: string;
        availableActionName : string;
        metadata : any;
    }[]>([]);
    const [ selectedModalIndex, setSelectedModalIndex ] = useState<null | number>(null);

    return <div>
        <Appbar/>
        <div className="flex justify-end bg-slate-200 p-4">
            <PrimaryButton onClick={async() => {
                if(!selectedTrigger?.id){
                    return;
                }

                const response = await axios.post(`${BACKEND__URL}/api/v1/zap`, {
                    "availableTriggerId" : selectedTrigger.id,
                    "triggeredMetadata" : {},
                    "actions" : selectedActions.map(a => ({
                        availableActionId : a.availableActionId,
                        actionMetadata : a.metadata
                    }))   
                }, {
                    headers : {
                        Authorization : localStorage.getItem("token")
                    }
                })

                router.push("/dashboard");
            }}>
                Publish
            </PrimaryButton>
        </div>
        <div className="w-full min-h-screen bg-slate-200 flex flex-col justify-center">
            <div className="flex justify-center w-full"> 
                <ZapCell name={selectedTrigger?.name ? selectedTrigger.name : "Trigger"} index={1} onClick={() => {
                    setSelectedModalIndex(1);
                }} />
            </div>

            <div className="w-full pt-2 pb-2" > 
                {selectedActions.map((action, index) => <div className="pt-2 flex justify-center">
                    <ZapCell name={action.availableActionName ? action.availableActionName : "Action"} index={action.index} onClick={() => {
                        setSelectedModalIndex(action.index);
                    }}/>
                    </div>)}
            </div>
            <div className="flex justify-center">
                <div>
                    <PrimaryButton onClick={() => {
                        setSelectedActions(a=> [...a, {
                            index: a.length + 2,
                            availableActionId: "",
                            availableActionName : "",
                            metadata : {}
                        }])
                    }}><div className="text-2xl">
                            +
                        </div></PrimaryButton>
                </div>
            </div>
        </div>
        {selectedModalIndex}
        {selectedModalIndex && <Modal availableItems = {selectedModalIndex === 1 ? availableTriggers : availableActions} index={selectedModalIndex} onSelect={(props : null |  {name:string, id: string, metadata:any}) => {
            if( props ===  null){
                setSelectedModalIndex(null)
                return;
            }
            if(selectedModalIndex ===1){
                setSelectedTrigger({
                    id : props.id,
                    name : props.name
                })
            }else { 
                setSelectedActions(a=>{
                    let newActions = [...a];
                    newActions[selectedModalIndex -2] = {
                        index : selectedModalIndex,
                        availableActionId : props.id,
                        availableActionName : props.name,
                        metadata : props.metadata
                    }
                    return newActions
                })
            }
            setSelectedModalIndex(null);
        }} />}
    </div>
}


function Modal ({index, onSelect, availableItems}: {
    index : number,
    onSelect : (props : null |  {name:string, id: string, metadata : any;}) => void,
    availableItems : {id:string, name:string, image:string}[]
}){

    const [step, setStep] = useState(0);
    const isTrigger = index === 1;
    const [selectedAction, setSelectedAction] = useState<{
        id: string;
        name : string;
    }>();
    
    return <div className=" fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] 
    max-h-full flex bg-slate-100 bg-opacity-70">
    <div className="relative p-4 w-full max-w-2xl max-h-full  ">
        <div className="relative bg-white border border-default rounded-base shadow-sm p-4 md:p-6">
            <div className="flex items-center justify-between border-b border-default pb-4 md:pb-5">
                <div className="text-xl">
                    Select {index===1 ? "Trigger" : "Action"}
                </div>
                <button onClick={() => {
                    onSelect(null);
                }} type="button" className="text-body hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-9 ms-auto inline-flex justify-center items-center" data-modal-hide="default-modal">
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/></svg>
                    <span className="sr-only">Close modal</span>
                </button>
            </div>
            {/* {JSON.stringify(selectedAction)} */}
            {step === 1 && selectedAction?.name === "upi" && <UpiSelector setMetaData={(metadata) => {
                onSelect ({
                    ...selectedAction,
                    metadata
                })
            }}/>}
            
            {step === 1 && selectedAction?.name === "email" && <EmailSelector setMetaData={(metadata) => {
                onSelect ({
                    ...selectedAction,
                    metadata
                })
            }}/>}

            {step === 0 && <div className="space-y-4 md:space-y-6 py-4 md:py-6">
                {availableItems.map(({id, name, image})=>{
                    return <div onClick={() => {
                        if(isTrigger){
                            onSelect({
                            id,
                            name,
                            metadata : {}
                        })
                        }else{
                            setStep(s => s+1);
                            setSelectedAction({
                                id,
                                name
                            })
                        }
                        
                    }} className="flex border p-4 cursor-pointer hover:bg-slate-100">
                        <img src={image} width={30} className="rounded-full "/>
                        <div className="flex flex-col justify-center"> 
                            {name}
                        </div>
                        
                    </div>
                })}
            </div>}

        </div>
    </div>
</div>     
}

function EmailSelector({setMetaData} : {
    setMetaData : (params : any) => void;
}){
    const [email, setEmail] = useState("");
    const [body, setBody] = useState("");

    return <div>
        <Input label="To" type="text" placeholder="To" onChange={(e)=>setEmail(e.target.value)}></Input>
        <Input label="Body" type="text" placeholder="body" onChange={(e)=>setBody(e.target.value)}></Input>
        <div className="pt-2">
            <PrimaryButton onClick={() => {setMetaData({ email, body})}}>Submit</PrimaryButton>
        </div>
    </div>
}

function UpiSelector({setMetaData} : {
    setMetaData : (params : any) => void;
}){
    const [amount, setAmount] = useState("");
    const [address, setAddress] = useState("");

    return <div>
        <Input label="To" type="text" placeholder="To" onChange={(e)=>setAddress(e.target.value)}></Input>
        <Input label="Amount" type="text" placeholder="body" onChange={(e)=>setAmount(e.target.value)}></Input>
        <div className="pt-4">
            <PrimaryButton onClick={() => {setMetaData({ amount, address})}}>Submit</PrimaryButton>
        </div>
    </div>
}