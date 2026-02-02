import { ReactNode } from "react"

export const PrimaryButton = ({ children, onClick, size = "small" } : {
    children : ReactNode,
    onClick : () => void,
    size?  : "big" | "small"
}) => {
    return (
        <button 
            onClick={onClick} 
            className={`
                ${size === "small" ? "text-sm px-8 py-2.5" : "text-xl px-10 py-4"} 
                w-full md:w-auto
                bg-[#ff4f00] hover:bg-[#e04500] 
                text-white rounded-full font-semibold tracking-wide
                shadow-md hover:shadow-lg
                transition-all duration-200 
                active:scale-95 
                flex justify-center items-center
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff4f00]
            `}
        >
            {children}
        </button>
    )
}