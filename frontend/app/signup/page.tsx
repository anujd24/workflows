"use client";

import { Appbar } from "@/components/Appbar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { CheckFeature } from "@/components/CheckFeature";
import { Input } from "@/components/Input";
import { useState } from "react";
import axios from "axios";
import { BACKEND__URL } from "../config";
import { useRouter } from "next/navigation";
import Link from "next/link"; 

export default function Signup() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const handleSignup = async () => {
        try {
            const res = await axios.post(`${BACKEND__URL}/api/v1/user/signup`, {
                username: email,
                password,
                name
            });
            router.push("/login");
        } catch (e) {
            alert("Signup failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Appbar />
            
            <div className="grid grid-cols-1 md:grid-cols-2">
                
                <div className="hidden md:flex flex-col justify-center px-12 lg:px-20 bg-slate-50 border-r border-slate-200 min-h-[calc(100vh-65px)] relative overflow-hidden">
                    <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                    <div className="relative z-10">
                        <h2 className="font-bold text-4xl text-slate-900 leading-tight mb-8 max-w-md">
                            Join millions worldwide who automate their work using ZapFlux.
                        </h2>
                        
                        <div className="space-y-6">
                            <CheckFeature label="Easy setup, no coding required" />
                            <CheckFeature label="Free forever for core features" />
                            <CheckFeature label="14-day trial of premium features & apps" />
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center p-6 md:p-12 min-h-[calc(100vh-65px)]">
                    <div className="w-full max-w-md bg-white p-0 md:p-8 rounded-lg">
                        
                        <div className="mb-8 md:hidden">
                            <h2 className="text-2xl font-bold text-slate-900">Get started for free</h2>
                        </div>

                        <div className="space-y-5">
                            <Input 
                                label="Name" 
                                onChange={e => setName(e.target.value)} 
                                type="text" 
                                placeholder="Your name"
                            />
                            
                            <Input 
                                label="Email" 
                                onChange={e => setEmail(e.target.value)} 
                                type="text" 
                                placeholder="Your email"
                            />
                            
                            <Input 
                                label="Password" 
                                onChange={e => setPassword(e.target.value)} 
                                type="password" 
                                placeholder="Password"
                            />

                            <div className="pt-4">
                                <PrimaryButton onClick={handleSignup} size="big">
                                    Get Started Free
                                </PrimaryButton>
                            </div>
                        </div>

                        <div className="mt-6 text-center text-sm text-slate-600">
                            Already have an account?{" "}
                            <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500 hover:underline">
                                Log in
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}