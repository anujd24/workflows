import { ReactNode } from "react"

export const DarkButton = ({ children, onClick, size = "small" } : {
    children : ReactNode,
    onClick : () => void,
    size?  : "big" | "small"
}) => {
    return (
        <button 
            onClick={onClick} 
            className={`
                flex items-center justify-center 
                ${size === "small" ? "text-sm px-8 py-2" : "text-xl px-10 py-3"} 
                bg-[#7B1FA2] hover:bg-[#6a1b9a] 
                text-white 
                rounded-md font-medium
                shadow-md hover:shadow-lg
                cursor-pointer 
                transition-all duration-200 
                active:scale-95 
                focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2
            `}
        >
            {children}
        </button>
    )
}