import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, FileText, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
    { label: "Home", path: "/", icon: LayoutDashboard },
    { label: "Billing", path: "/billing", icon: ShoppingBag },
    { label: "Menu", path: "/menu", icon: UtensilsCrossed },
    { label: "Orders", path: "/orders", icon: FileText },
    { label: "Stats", path: "/analytics", icon: TrendingUp },
];

export default function MobileNav() {
    const location = useLocation();

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 lg:hidden z-50 flex justify-around items-center px-2 py-3 pb-safe">
            {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px]",
                            isActive ? "text-emerald-600 bg-emerald-50" : "text-stone-400 hover:text-stone-600"
                        )}
                    >
                        <item.icon className={cn("w-5 h-5", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
