import { Check } from "lucide-react";

export const CheckFeature = ({ label }: { label: string }) => {
    return (
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-lg font-medium text-slate-700">
                {label}
            </div>
        </div>
    );
}