import { useState, useEffect } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { startOfDay, endOfDay } from "date-fns";
import type { Bill } from "../billing/types";

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
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const todayStart = startOfDay(new Date());
            const todayEnd = endOfDay(new Date());

            // 1. Fetch Today's Orders
            const ordersQuery = query(
                collection(db, "orders"),
                where("date", ">=", Timestamp.fromDate(todayStart)),
                where("date", "<=", Timestamp.fromDate(todayEnd))
            );
            const ordersSnap = await getDocs(ordersQuery);
            const orders = ordersSnap.docs.map(d => d.data() as Bill).filter(o => o.status === "Completed");

            // 2. Fetch Stock for Low Stock Alert
            const itemsQuery = query(collection(db, "menuItems"));
            // Ideally query only available=true or just all to count low stock
            const itemsSnap = await getDocs(itemsQuery);
            let lowStockCount = 0;
            itemsSnap.forEach(doc => {
                const data = doc.data();
                const remaining = (data.preparedQuantity || 0) - (data.soldQuantity || 0);
                if (remaining < 10 && remaining > 0) lowStockCount++;
            });

            // 3. Process Stats
            const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
            const totalBills = orders.length;
            const avgBillValue = totalBills > 0 ? Math.round(totalRevenue / totalBills) : 0;

            const paymentSplit = { Cash: 0, UPI: 0, Card: 0 };
            orders.forEach(o => {
                if (paymentSplit[o.paymentMode] !== undefined) {
                    paymentSplit[o.paymentMode] += o.totalAmount;
                }
            });

            // Revenue by Hour
            const hoursMap = new Map<number, number>();
            orders.forEach(o => {
                const hour = o.date.toDate().getHours();
                hoursMap.set(hour, (hoursMap.get(hour) || 0) + o.totalAmount);
            });

            const revenueByHour = Array.from({ length: 24 }, (_, i) => ({
                hour: `${i}:00`,
                amount: hoursMap.get(i) || 0
            }));

            // Category Sales
            const catMap = new Map<string, number>();
            orders.forEach(o => {
                o.items.forEach(item => {
                    // We don't have category in BillItem, need to fetch or store it?
                    // Limitation: BillItem stores itemId/name. We can't easily group by Category without looking up.
                    // For now, let's group by Item Name or just Skip Category if expensive, 
                    // OR we modify useBilling to store category in BillItem (Better).
                    // Assuming we can't change schema easily now, let's do top items instead?
                    // Or simpler: Map itemName -> quantity.
                    catMap.set(item.name, (catMap.get(item.name) || 0) + item.total);
                });
            });
            // Convert to array
            const categorySales = Array.from(catMap.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5); // Top 5 items really

            setStats({
                totalRevenue,
                totalBills,
                avgBillValue,
                paymentSplit,
                revenueByHour,
                categorySales, // Top 5 Items actually
                lowStockCount
            });

        } catch (err) {
            console.error("Dashboard Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return { stats, loading, refresh: fetchDashboardData };
}
