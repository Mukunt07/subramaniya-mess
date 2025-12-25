import { useState, useEffect } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import type { Bill } from "../billing/types";
import type { MenuItem } from "../menu/types";

export interface AnalyticsData {
    dailyRevenue: { date: string; amount: number }[];
    wastage: { name: string; prepared: number; sold: number; wastage: number; cost: number }[];
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
                where("date", ">=", Timestamp.fromDate(start)),
                where("date", "<=", Timestamp.fromDate(end))
            );

            const ordersSnap = await getDocs(ordersQuery);
            const orders = ordersSnap.docs.map(d => ({ ...d.data(), date: d.data().date.toDate() })) as (Bill & { date: Date })[];

            // Group by Date
            const revenueMap = new Map<string, number>();
            // Initialize last 7 days with 0
            for (let i = 0; i < 7; i++) {
                const d = subDays(new Date(), i);
                revenueMap.set(format(d, "yyyy-MM-dd"), 0);
            }

            orders.forEach(o => {
                if (o.status === "Completed") {
                    const dateKey = format(o.date, "yyyy-MM-dd");
                    if (revenueMap.has(dateKey)) {
                        revenueMap.set(dateKey, (revenueMap.get(dateKey) || 0) + o.totalAmount);
                    }
                }
            });

            const dailyRevenue = Array.from(revenueMap.entries())
                .map(([date, amount]) => ({
                    date: format(new Date(date), "dd MMM"),
                    fullDate: date,
                    amount
                }))
                .sort((a, b) => a.fullDate.localeCompare(b.fullDate));

            // 2. Wastage (Current Day Snapshot from Menu Items)
            const menuQuery = query(collection(db, "menuItems"));
            const menuSnap = await getDocs(menuQuery);
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

            setData({ dailyRevenue, wastage });

        } catch (err) {
            console.error("Analytics Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, refresh: fetchAnalytics };
}
