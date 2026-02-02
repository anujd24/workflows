"use client";

import { ReactNode } from "react";

export const LinkButton = ({ children, onClick } : { children : ReactNode, onClick : () => void} ) => {
    return (
        <button 
            onClick={onClick} 
            className="
                flex justify-center items-center px-4 py-2 
                cursor-pointer 
                hover:bg-[#ebe9df] 
                text-slate-800 font-medium text-sm rounded-md
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1
            "
        >
            {children}
        </button>
    )
}