import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import OfflineIndicator from "../ui/OfflineIndicator";
import MobileNav from "./MobileNav";
import { cn } from "../../lib/utils";

export default function Layout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-stone-50 flex">
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
            <main
                className={cn(
                    "flex-1 min-h-screen transition-all duration-300 ease-in-out",
                    isCollapsed ? "lg:ml-20" : "lg:ml-64"
                )}
            >
                <OfflineIndicator />
                <Outlet />
            </main>
            <MobileNav />
        </div>
    );
}
