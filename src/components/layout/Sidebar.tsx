import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, UtensilsCrossed, FileText, Settings, LogOut, TrendingUp, ShoppingBag } from "lucide-react";
import { useAuth } from "../../features/auth/AuthContext";
import { auth } from "../../lib/firebase";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Billing", path: "/billing", icon: ShoppingBag },
    { label: "Menu & Stock", path: "/menu", icon: UtensilsCrossed },
    { label: "Orders", path: "/orders", icon: FileText },
    { label: "Analytics", path: "/analytics", icon: TrendingUp },
    { label: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
    const location = useLocation();
    const { } = useAuth(); // Just to checking if user exists, already protected by layout

    const handleLogout = () => {
        if (confirm("Are you sure you want to logout?")) {
            auth.signOut();
        }
    };

    return (
        <aside className="w-64 bg-stone-900 border-r border-stone-800 flex flex-col h-screen fixed left-0 top-0 z-50">
            <div className="p-6 border-b border-stone-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <UtensilsCrossed className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                    <h1 className="font-bold text-white text-lg leading-tight">Veg Mess</h1>
                    <p className="text-xs text-stone-500">Admin Panel</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                                isActive
                                    ? "bg-emerald-600/10 text-emerald-400"
                                    : "text-stone-400 hover:bg-stone-800 hover:text-white"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive ? "text-emerald-500" : "text-stone-500 group-hover:text-stone-300"
                                )}
                            />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-stone-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-stone-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 text-sm font-medium group"
                >
                    <LogOut className="w-5 h-5 text-stone-500 group-hover:text-red-400" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
