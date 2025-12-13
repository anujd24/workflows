"use client";

import { ReactNode } from "react";

export const LinkButton = ({ children, onClick } : { children : ReactNode, onClick : () => void} ) => {
    return <div className=" flex justify-center px-4 py-2 cursor-pointer hover:bg-[#ebe9df] font-light text-sm rounded" onClick={onClick}>
        {children}
    </div>
}