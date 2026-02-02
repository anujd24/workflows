import { ReactNode } from "react"

export const SecondaryButton = ({ children, onClick, size = "small" } : {
    children : ReactNode,
    onClick : () => void,
    size?  : "big" | "small"
}) => {
    return (
        <button 
            onClick={onClick} 
            className={`
                ${size === "small" ? "text-sm px-8 py-2.5" : "text-xl px-12 py-4"} 
                w-full md:w-auto
                border border-black 
                text-black bg-transparent hover:bg-slate-100
                rounded-full font-semibold tracking-wide
                cursor-pointer 
                transition-all duration-200 
                active:scale-95 
                flex justify-center items-center
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
            `}
        >
            {children}
        </button>
    )
}