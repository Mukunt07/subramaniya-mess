import { useState, useEffect } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import type { Bill } from "../billing/types";
import type { MenuItem } from "../menu/types";

export interface AnalyticsData {
    dailyRevenue: { date: string; amount: number }[];
    wastage: { name: string; prepared: number; sold: number; wastage: number; cost: number }[];
    categorySales: { name: string; value: number; count: number }[];
    itemSales: { name: string; value: number; count: number }[];
}

export function useAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // 1. Historical Revenue (Last 7 Days)
            const end = endOfDay(new Date());
            const start = startOfDay(subDays(new Date(), 6)); // 7 days total

            const ordersQuery = query(
                collection(db, "orders"),
                where("createdAt", ">=", Timestamp.fromDate(start)),
                where("createdAt", "<=", Timestamp.fromDate(end))
            );

            const ordersSnap = await getDocs(ordersQuery);
            const orders = ordersSnap.docs.map(d => ({ ...d.data(), date: d.data().createdAt.toDate() })) as (Bill & { date: Date })[];

            // Aggregation Maps
            const revenueMap = new Map<string, number>();
            const categoryMap = new Map<string, { value: number; count: number }>();
            const itemMap = new Map<string, { value: number; count: number }>();

            // Initialize last 7 days with 0
            for (let i = 0; i < 7; i++) {
                const d = subDays(new Date(), i);
                revenueMap.set(format(d, "yyyy-MM-dd"), 0);
            }

            orders.forEach(o => {
                if (o.status === "Paid") {
                    // Revenue
                    const dateKey = format(o.date, "yyyy-MM-dd");
                    if (revenueMap.has(dateKey)) {
                        revenueMap.set(dateKey, (revenueMap.get(dateKey) || 0) + o.totalAmount);
                    }

                    // Categories & Items
                    o.items.forEach(item => {
                        // Category (Need to fallback if category missing in BillItem, currently BillItem has it? Check types.ts. 
                        // Actually BillItem in types.ts does NOT have category. 
                        // Use MenuItems snapshot to map? Or assuming we just track item names for now.
                        // Wait, BillItem doesn't have category. We cannot aggregate by category easily without joining.
                        // UseDashboard loops `completedOrders` but assumes items have category? 
                        // Let's check BillItem definition again.

                        // Item Sales
                        const currentItem = itemMap.get(item.name) || { value: 0, count: 0 };
                        itemMap.set(item.name, {
                            value: currentItem.value + item.total,
                            count: currentItem.count + item.quantity
                        });
                    });
                }
            });

            // Need Category Data: Fetch all menu items to map IDs/Names to Categories
            const menuQuery = query(collection(db, "menuItems"));
            const menuSnap = await getDocs(menuQuery);
            const menuItemsMap = new Map<string, MenuItem>();
            menuSnap.docs.forEach(doc => {
                const d = doc.data() as MenuItem;
                menuItemsMap.set(d.id, d); // Map by ID
                menuItemsMap.set(d.name, d); // Map by Name as fallback
            });

            // Re-iterate orders for Category (now that we have menu map)
            orders.forEach(o => {
                if (o.status === "Paid") {
                    o.items.forEach(item => {
                        // Try lookup by itemId, then name
                        const menuItem = menuItemsMap.get(item.itemId) || menuItemsMap.get(item.name);
                        if (menuItem) {
                            const cat = menuItem.category;
                            const currentCat = categoryMap.get(cat) || { value: 0, count: 0 };
                            categoryMap.set(cat, {
                                value: currentCat.value + item.total,
                                count: currentCat.count + item.quantity
                            });
                        }
                    });
                }
            });

            const dailyRevenue = Array.from(revenueMap.entries())
                .map(([date, amount]) => ({
                    date: format(new Date(date), "dd MMM"),
                    fullDate: date,
                    amount
                }))
                .sort((a, b) => a.fullDate.localeCompare(b.fullDate));

            const categorySales = Array.from(categoryMap.entries())
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.value - a.value);

            const itemSales = Array.from(itemMap.entries())
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 10); // Top 10 items

            // 2. Wastage (Current Day Snapshot from Menu Items)
            // ... existing wastage logic ...
            const wastage = menuSnap.docs.map(doc => {
                const item = doc.data() as MenuItem;
                const remaining = item.preparedQuantity - item.soldQuantity;
                if (remaining <= 0) return null; // No wastage

                return {
                    name: item.name,
                    prepared: item.preparedQuantity,
                    sold: item.soldQuantity,
                    wastage: remaining,
                    cost: remaining * item.price // Potential loss revenue
                };
            }).filter(Boolean) as AnalyticsData['wastage'];

            wastage.sort((a, b) => b.cost - a.cost);

            setData({ dailyRevenue, wastage, categorySales, itemSales });

        } catch (err) {
            console.error("Analytics Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, refresh: fetchAnalytics };
}
