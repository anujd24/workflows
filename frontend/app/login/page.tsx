"use client";

import { Appbar } from "@/components/Appbar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { CheckFeature } from "@/components/CheckFeature";
import { Input } from "@/components/Input";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BACKEND__URL } from "../config";

console.log(BACKEND__URL);
export default function(){
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    return <div>
        
        <Appbar/>
        <div className="flex justify-center">
            <div className="flex pt-8 max-w-4xl gap-2">
                <div className="flex-1 pt-20  px-4  ">
                    <div className="font-semibold text-3xl  pb-4">
                        Join millions worldwide who automate their work using zapier.
                    </div>
                    <div className="pb-6 pt-4">
                        <CheckFeature label="Easy setup, no coding required"/>
                    </div>
                    <div className="pb-6">
                        <CheckFeature label="Free forever for code features"/>
                    </div>
                    <CheckFeature label="14 day trial of premium features & apps"/>
                </div> 
                <div className="flex-1 pt-6 pb-6 mt-12 px-4 border rounded">

                    <Input label="Email" onChange={ e=> {
                        setEmail(e.target.value)
                    }} type="text" placeholder="Your email"/>

                    <Input label="Password" onChange={ e=> {
                        setPassword(e.target.value)
                    }} type="password" placeholder="Your password"/>
                    <div className="pt-4">
                        <PrimaryButton onClick={async() => {
                            const res = await axios.post(`${BACKEND__URL}/api/v1/user/signin`, {
                                username : email,
                                password
                            });
                            localStorage.setItem("token", res.data.token);
                            router.push("/dashboard");
                        }} size="big">Log in</PrimaryButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
}