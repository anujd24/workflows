"use client";

import { useRouter } from "next/navigation"
import { LinkButton } from "./buttons/LinkButton"
import { PrimaryButton } from "./buttons/PrimaryButton";


export const Appbar = () => {
    const router = useRouter();
    return <div className="flex border-b justify-between p-4">
        <div className="flex flex-col justify-center text-2xl font-extrabold">
            Anuj
        </div>

        <div className="flex ">
            <div className="pr-4">
                <LinkButton onClick={() => {}}>
                    Contact sales
                </LinkButton>
            </div>
            
            <div className="pr-4">
                <LinkButton onClick={() => {
                    router.push("/login")
                }}>
                    Log in
                </LinkButton>
            </div>
            <PrimaryButton onClick={() => {
                router.push("/signup")
            }}>
                Sign up
            </PrimaryButton>
        </div>
    </div>
}