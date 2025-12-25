import { useState } from "react";
import {
    collection,
    runTransaction,
    serverTimestamp,
    doc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useSettings } from "../settings/useSettings"; // To get bill prefix/settings
import type { Bill, BillItem, PaymentMode } from "./types";
import type { MenuItem } from "../menu/types";

import { useActivityLogs } from "../activityLogs/useActivityLogs";

export function useBilling() {
    const [loading, setLoading] = useState(false);
    const { settings } = useSettings();
    const { logActivity } = useActivityLogs();

    const createBill = async (
        items: BillItem[],
        paymentMode: PaymentMode,
        gstEnabled: boolean
    ) => {
        setLoading(true);
        try {
            // ... existing validation ...
            if (items.length === 0) throw new Error("No items in bill");

            const subtotal = items.reduce((sum, item) => sum + item.total, 0);
            const gstAmount = gstEnabled ? (subtotal * settings.gstPercentage) / 100 : 0;
            const totalAmount = Math.round(subtotal + gstAmount);
            let newBillId = "";

            await runTransaction(db, async (transaction) => {
                // ... existing logic ...
                // 1. Check Stock
                for (const item of items) {
                    const itemRef = doc(db, "menuItems", item.itemId);
                    const itemDoc = await transaction.get(itemRef);

                    if (!itemDoc.exists()) throw new Error(`Item ${item.name} not found`);

                    const itemData = itemDoc.data() as MenuItem;
                    const newSold = itemData.soldQuantity + item.quantity;
                    const prepared = itemData.preparedQuantity;
                    const remaining = prepared - newSold;

                    if (remaining < 0) {
                        throw new Error(`Insufficient stock for ${item.name}. Available: ${prepared - itemData.soldQuantity}`);
                    }

                    // 2. Update Stock
                    let updates: any = { soldQuantity: newSold };

                    // Auto disable if stock hits 0 and setting enabled
                    if (remaining === 0 && settings.autoDisableStock) {
                        updates.available = false;
                    }

                    transaction.update(itemRef, updates);
                }

                // 3. Generate Bill Number
                const counterRef = doc(db, "settings", "counters");
                const counterDoc = await transaction.get(counterRef);
                let seq = 1;
                if (counterDoc.exists()) {
                    seq = counterDoc.data().billSequence + 1;
                    transaction.update(counterRef, { billSequence: seq });
                } else {
                    transaction.set(counterRef, { billSequence: 1 });
                }

                const billNumber = `${settings.billPrefix}-${String(seq).padStart(4, '0')}`;

                // 4. Create Bill
                const newBillRef = doc(collection(db, "orders"));
                newBillId = newBillRef.id;
                const newBill: Bill = {
                    billNumber,
                    items,
                    subtotal,
                    gstEnabled,
                    gstAmount,
                    totalAmount,
                    paymentMode,
                    status: "Completed",
                    createdAt: serverTimestamp() as any,
                    cancelledAt: null,
                };
                transaction.set(newBillRef, newBill);
            });

            // Log activity outside transaction (best effort)
            if (newBillId) {
                logActivity("BILL_CREATED", newBillId, `Bill created with ${items.length} items. Total: ${totalAmount}`);
            }

            return { success: true };
        } catch (err: any) {
            console.error("Billing Error:", err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return { createBill, loading };
}
