import { useState, useEffect } from "react";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    runTransaction,
    serverTimestamp
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { Bill } from "../billing/types";
import type { MenuItem } from "../menu/types";

import { useActivityLogs } from "../activityLogs/useActivityLogs";

export function useOrders() {
    const [orders, setOrders] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const { logActivity } = useActivityLogs();

    useEffect(() => {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Bill[];
            setOrders(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const cancelOrder = async (orderId: string) => {
        try {
            await runTransaction(db, async (transaction) => {
                const orderRef = doc(db, "orders", orderId);
                const orderDoc = await transaction.get(orderRef);

                if (!orderDoc.exists()) throw new Error("Order not found");
                const orderData = orderDoc.data() as Bill;

                if (orderData.status === "Cancelled") throw new Error("Order already cancelled");

                // Revert Stock
                for (const item of orderData.items) {
                    const itemRef = doc(db, "menuItems", item.itemId);
                    const itemDoc = await transaction.get(itemRef);

                    if (itemDoc.exists()) {
                        const menuItem = itemDoc.data() as MenuItem;
                        const newSold = Math.max(0, menuItem.soldQuantity - item.quantity);
                        transaction.update(itemRef, { soldQuantity: newSold });
                    }
                }

                // Update Order Status
                transaction.update(orderRef, {
                    status: "Cancelled",
                    cancelledAt: serverTimestamp()
                });
            });

            // Log activity
            logActivity("BILL_CANCELLED", orderId, "Order cancelled and stock reverted");

            return true;
        } catch (err) {
            console.error("Cancellation Error:", err);
            return false;
        }
    };

    return { orders, loading, cancelOrder };
}
