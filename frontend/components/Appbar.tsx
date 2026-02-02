"use client";

import { useRouter } from "next/navigation";
import { LinkButton } from "./buttons/LinkButton";
import { PrimaryButton } from "./buttons/PrimaryButton";
import { useEffect, useState } from "react";

export const Appbar = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        router.push("/");
    }

    return (
        <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="flex justify-between items-center p-4 max-w-7xl mx-auto">
                <div 
                    onClick={() => router.push('/')}
                    className="text-2xl font-extrabold cursor-pointer hover:opacity-80 transition-opacity"
                >
                    ZapFlux
                </div>

                <div className="hidden md:flex gap-8 font-medium text-slate-600 text-sm">
                    <span className="cursor-pointer hover:text-slate-900">Products</span>
                    <span className="cursor-pointer hover:text-slate-900">Solutions</span>
                    <span className="cursor-pointer hover:text-slate-900">Pricing</span>
                </div>

                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <>
                            <LinkButton onClick={() => router.push("/dashboard")}>
                                Dashboard
                            </LinkButton>
                            <PrimaryButton onClick={logout}>
                                Log out
                            </PrimaryButton>
                        </>
                    ) : (
                        <>
                            <LinkButton onClick={() => {}}>
                                Contact Sales
                            </LinkButton>
                            
                            <LinkButton onClick={() => router.push("/login")}>
                                Log in
                            </LinkButton>

                            <PrimaryButton onClick={() => router.push("/signup")}>
                                Sign up
                            </PrimaryButton>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}