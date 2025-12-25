import { useState, useEffect } from "react";
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    query,
    orderBy
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { MenuItem, MenuItemInput } from "./types";

export function useMenu() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Query ordered by category only to avoid needing a composite index
        const q = query(collection(db, "menuItems"), orderBy("category"));
        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const menuItems = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as MenuItem[];

                // Secondary sort by name on client side
                menuItems.sort((a, b) => {
                    if (a.category === b.category) {
                        return a.name.localeCompare(b.name);
                    }
                    return 0; // Category order is already handled by Firestore
                });

                setItems(menuItems);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching menu:", err);
                setError("Failed to load menu items");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const addItem = async (input: MenuItemInput) => {
        try {
            await addDoc(collection(db, "menuItems"), {
                ...input,
                soldQuantity: 0,
                available: true,
                preparedDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            return true;
        } catch (err) {
            console.error("Error adding item:", err);
            return false;
        }
    };

    const updateItem = async (id: string, updates: Partial<MenuItem>) => {
        try {
            const docRef = doc(db, "menuItems", id);

            // If updating prepared quantity, check availability logic? 
            // For now, simple update. Complex logic can be handled in the UI handler or here.
            // E.g. if prepared > sold, maybe set available = true automatically?
            // Requirement says: "Remaining = 0 -> Available = false".
            // It doesn't strictly say "Remaining > 0 -> Available = true".

            await updateDoc(docRef, updates);
            return true;
        } catch (err) {
            console.error("Error updating item:", err);
            return false;
        }
    };

    const toggleAvailability = async (id: string, currentStatus: boolean) => {
        return updateItem(id, { available: !currentStatus });
    };

    return { items, loading, error, addItem, updateItem, toggleAvailability };
}
