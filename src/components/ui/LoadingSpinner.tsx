import { Loader2, UtensilsCrossed } from "lucide-react";
import { cn } from "../../lib/utils";

interface LoadingSpinnerProps {
    className?: string;
    size?: "sm" | "md" | "lg";
    text?: string;
    fullScreen?: boolean;
}

export default function LoadingSpinner({
    className,
    size = "md",
    text = "Loading...",
    fullScreen = true
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-5 h-5",
        md: "w-8 h-8",
        lg: "w-12 h-12"
    };

    const containerClasses = fullScreen
        ? "min-h-[60vh] flex flex-col items-center justify-center"
        : "flex flex-col items-center justify-center p-8";

    return (
        <div className={cn(containerClasses, className)}>
            <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                <div className="relative bg-white p-4 rounded-2xl shadow-lg border border-emerald-100 flex items-center justify-center">
                    <Loader2 className={cn("animate-spin text-emerald-600", sizeClasses[size])} />
                </div>
                {/* Optional: Add a small logo badge */}
                <div className="absolute -bottom-2 -right-2 bg-stone-900 rounded-full p-1.5 shadow-md border border-stone-700">
                    <UtensilsCrossed className="w-3 h-3 text-emerald-500" />
                </div>
            </div>
            {text && (
                <p className="mt-6 text-stone-400 text-sm font-medium animate-pulse tracking-wide uppercase">
                    {text}
                </p>
            )}
        </div>
    );
}
