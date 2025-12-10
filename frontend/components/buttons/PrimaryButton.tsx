import { ReactNode } from "react"

export const PrimaryButton = ({ children, onClick, size = "small" } : {
    children : ReactNode,
    onClick : () => void,
    size?  : "big" | "small"

}) => {
    return <div onClick={onClick} className={`${size === "small" ? "text-sm" : "text-xl"} 
    ${size === "small" ? "px-8 py-2" : "px-14 py-4"} bg-[#ff4f00] text-white rounded-full cursor-pointer hover:shadow-md text-center`}>
        {children}
    </div>
}