import { useState, useEffect } from "react";
import { collection, query, where, Timestamp, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { startOfDay, endOfDay } from "date-fns";
import type { Bill } from "../billing/types";
import type { MenuItem } from "../menu/types";

export interface DashboardStats {
    totalRevenue: number;
    totalBills: number;
    avgBillValue: number;
    paymentSplit: {
        Cash: number;
        UPI: number;
        Card: number;
    };
    revenueByHour: { hour: string; amount: number }[];
    categorySales: { name: string; value: number }[];
    lowStockCount: number;
}

export function useDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        // 1. Orders Listener
        const ordersQuery = query(
            collection(db, "orders"),
            where("createdAt", ">=", Timestamp.fromDate(todayStart)),
            where("createdAt", "<=", Timestamp.fromDate(todayEnd))
        );

        // 2. Menu Items Listener (for Low Stock)
        // We listen to all items to count low stock.
        const itemsQuery = query(collection(db, "menuItems"));

        let ordersData: Bill[] = [];
        let lowStockCount = 0;
        let initialLoadOrders = false;
        let initialLoadItems = false;

        const processStats = () => {
            if (!initialLoadOrders || !initialLoadItems) return;

            const completedOrders = ordersData.filter(o => o.status === "Completed");
            const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
            const totalBills = completedOrders.length;
            const avgBillValue = totalBills > 0 ? Math.round(totalRevenue / totalBills) : 0;

            const paymentSplit = { Cash: 0, UPI: 0, Card: 0 };
            completedOrders.forEach(o => {
                if (paymentSplit[o.paymentMode] !== undefined) {
                    paymentSplit[o.paymentMode] += o.totalAmount;
                }
            });

            // Revenue by Hour
            const hoursMap = new Map<number, number>();
            completedOrders.forEach(o => {
                const hour = o.createdAt.toDate().getHours();
                hoursMap.set(hour, (hoursMap.get(hour) || 0) + o.totalAmount);
            });

            const revenueByHour = Array.from({ length: 24 }, (_, i) => ({
                hour: `${i}:00`,
                amount: hoursMap.get(i) || 0
            }));

            // Category Sales
            const catMap = new Map<string, number>();
            completedOrders.forEach(o => {
                o.items.forEach(item => {
                    catMap.set(item.name, (catMap.get(item.name) || 0) + item.total);
                });
            });

            const categorySales = Array.from(catMap.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);

            setStats({
                totalRevenue,
                totalBills,
                avgBillValue,
                paymentSplit,
                revenueByHour,
                categorySales,
                lowStockCount
            });
            setLoading(false);
        };

        const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
            ordersData = snapshot.docs.map(doc => doc.data() as Bill);
            initialLoadOrders = true;
            processStats();
        }, (err) => {
            console.error("Error fetching orders:", err);
            setLoading(false);
        });

        const unsubItems = onSnapshot(itemsQuery, (snapshot) => {
            let count = 0;
            snapshot.docs.forEach(doc => {
                const data = doc.data() as MenuItem;
                const remaining = (data.preparedQuantity || 0) - (data.soldQuantity || 0);
                if (remaining < 10 && remaining > 0) count++;
            });
            lowStockCount = count;
            initialLoadItems = true;
            processStats();
        }, (err) => {
            console.error("Error fetching menu items:", err);
            setLoading(false);
        });

        return () => {
            unsubOrders();
            unsubItems();
        };
    }, []);

    // Manually refresh is no longer needed but kept for compatibility interface
    const refresh = () => { };

    return { stats, loading, refresh };
}
