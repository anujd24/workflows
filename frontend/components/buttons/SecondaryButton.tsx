import { ReactNode } from "react"

export const SecondaryButton = ({ children, onClick, size = "small" } : {
    children : ReactNode,
    onClick : () => void,
    size?  : "big" | "small"

}) => {
    return <div onClick={onClick} className={`${size === "small" ? "text-sm" : "text-xl"} 
    ${size === "small" ? "px-8 py-2" : "px-14 py-4"} border border-black text-black rounded-full cursor-pointer hover:shadow-md`}>
        {children}
    </div>
}