"use client";

export const Input = ({label, placeholder, onChange, type = "text"}: {
    label : string;
    placeholder : string;
    onChange : (e : any) => void;
    type?: "text" | "password" 
}) => {
    return <div>
        <div className="text-sm pb-1 pt-2">
           * <label > { label }</label>
        </div>
        <input type={type} className="border rounded px-4 py-2 w-full border-black" placeholder={placeholder} onChange={onChange}/>
    </div>
}