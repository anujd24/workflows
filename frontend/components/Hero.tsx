"use client";

import { useRouter } from "next/navigation";
import { PrimaryButton } from "./buttons/PrimaryButton";
import { SecondaryButton } from "./buttons/SecondaryButton";
import { Check } from "lucide-react"; 

export const Hero = () => {
    const router = useRouter();

    return (
        <div className="relative pt-20 pb-32 flex flex-col items-center justify-center min-h-[60vh] text-center overflow-hidden">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-purple-400 opacity-20 blur-[100px]"></div>
            </div>

            <div className="max-w-4xl px-4">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
                    Automate as fast as you can <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">type</span>
                </h1>

                <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
                    AI gives you automation superpowers, and ZapFlux puts them to work. 
                    Pairing AI and ZapFlux helps you turn ideas into workflows and bots that work for you.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                    <PrimaryButton 
                        onClick={() => router.push("/signup")} 
                        size="big"
                    >
                        Get Started Free
                    </PrimaryButton>
                    <SecondaryButton onClick={() => {}} size="big">
                        Contact Sales
                    </SecondaryButton>
                </div>

                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-slate-600">
                    <FeatureItem text="Free Forever for core features" />
                    <FeatureItem text="More apps than any other platform" />
                    <FeatureItem text="Cutting Edge AI features" />
                </div>
            </div>
        </div>
    );
};

function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="bg-green-100 p-1 rounded-full">
                <Check className="w-3 h-3 text-green-600" />
            </div>
            <span>{text}</span>
        </div>
    )
}