"use client";

import { Appbar } from "@/components/Appbar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { CheckFeature } from "@/components/CheckFeature";
import { Input } from "@/components/Input";
import { useState } from "react";
import axios from "axios";
import { BACKEND__URL } from "../config";
import { useRouter } from "next/navigation";


export default function(){
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    return <div>
        <Appbar/>
        <div className="flex justify-center">
            <div className="flex pt-8 max-w-4xl">
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
                    <Input label="Name" onChange={ e=> {
                        setName(e.target.value)
                    }} type="text" placeholder="Your name"/>

                    <Input label="Email" onChange={ e=> {
                        setEmail(e.target.value)
                    }} type="text" placeholder="Your email"/>

                    <Input label="Password" onChange={ e=> {
                        setPassword(e.target.value)
                    }} type="password" placeholder="Your password"/>
                    <div className="pt-4">
                        <PrimaryButton onClick={async() => {
                            const res = await axios.post(`${BACKEND__URL}/api/v1/user/signup`, {
                                username : email,
                                password,
                                name
                            });
                            router.push("/login")
                        }} size="big">Get Started for free</PrimaryButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
}