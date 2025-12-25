import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, UtensilsCrossed, FileText, Settings, LogOut, TrendingUp, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../../features/auth/AuthContext";
import { auth } from "../../lib/firebase";
import { cn } from "../../lib/utils";
import { useSettings } from "../../features/settings/useSettings";

const NAV_ITEMS = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Billing", path: "/billing", icon: ShoppingBag },
    { label: "Menu & Stock", path: "/menu", icon: UtensilsCrossed },
    { label: "Orders", path: "/orders", icon: FileText },
    { label: "Analytics", path: "/analytics", icon: TrendingUp },
    { label: "Settings", path: "/settings", icon: Settings },
];

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export default function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
    const location = useLocation();
    const { } = useAuth();
    const { settings } = useSettings();

    const handleLogout = () => {
        if (confirm("Are you sure you want to logout?")) {
            auth.signOut();
        }
    };

    return (
        <aside
            className={cn(
                "bg-stone-900 border-r border-stone-800 flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className={cn(
                "h-20 flex items-center gap-3 transition-all duration-300 border-b border-stone-800/50",
                isCollapsed ? "justify-center px-4" : "px-6"
            )}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/10 shadow-inner flex-shrink-0">
                    <UtensilsCrossed className="w-5 h-5 text-emerald-500" />
                </div>
                <div className={cn(
                    "flex-1 min-w-0 transition-all duration-300 ease-in-out",
                    isCollapsed ? "opacity-0 w-0 translate-x-[-10px] hidden" : "opacity-100 translate-x-0 block"
                )}>
                    <h1 className="font-medium text-stone-200 text-sm leading-snug truncate">{settings.restaurantName || "Veg Mess"}</h1>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-stone-500 mt-0.5">Admin Panel</p>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-9 bg-stone-800 text-stone-400 border border-stone-700 rounded-full p-1 hover:text-white hover:bg-stone-700 transition-colors shadow-sm z-50"
            >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            title={isCollapsed ? item.label : ""}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group text-sm font-medium relative",
                                isActive
                                    ? "bg-emerald-500/10 text-emerald-400 shadow-sm border border-emerald-500/10"
                                    : "text-stone-400 hover:bg-stone-800/50 hover:text-stone-200",
                                isCollapsed ? "justify-center" : "mx-0"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "w-5 h-5 transition-colors flex-shrink-0 z-10",
                                    isActive ? "text-emerald-500" : "text-stone-500 group-hover:text-stone-300"
                                )}
                            />
                            <span className={cn(
                                "whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden",
                                isCollapsed ? "max-w-0 opacity-0 hidden" : "max-w-[150px] opacity-100 block"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-stone-800">
                <button
                    onClick={handleLogout}
                    title={isCollapsed ? "Logout" : ""}
                    className={cn(
                        "flex items-center gap-3 p-3 w-full rounded-xl text-stone-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 text-sm font-medium group",
                        isCollapsed ? "justify-center" : ""
                    )}
                >
                    <LogOut className="w-5 h-5 text-stone-500 group-hover:text-red-400 flex-shrink-0" />
                    <span className={cn(
                        "whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden",
                        isCollapsed ? "max-w-0 opacity-0 hidden" : "max-w-[100px] opacity-100 block"
                    )}>
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    );
}
