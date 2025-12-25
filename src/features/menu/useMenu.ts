import { useState, useEffect } from "react";
import {
    collection,
    onSnapshot,
    updateDoc,
    doc,
    serverTimestamp,
    query,
    orderBy,
    writeBatch,
    runTransaction,
    getDocs
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

    const deleteItem = async (id: string, name: string) => {
        try {
            const batch = writeBatch(db);

            // Delete from active menu
            const itemRef = doc(db, "menuItems", id);
            batch.delete(itemRef);

            // Delete from templates (to prevent auto-restore)
            // Reconstruct template ID from name (same logic as addItem/restoreDefaults)
            const templateId = `TPL-${name.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
            const templateRef = doc(db, "menuTemplates", templateId);
            batch.delete(templateRef);

            await batch.commit();
            return true;
        } catch (err) {
            console.error("Error deleting item:", err);
            return false;
        }
    };

    /**
     * Generates the next sequential ID (e.g., ITEM-001) using a counter document.
     * Uses a transaction to ensure atomicity.
     */
    const getNextIds = async (count: number = 1): Promise<number | null> => {
        const counterRef = doc(db, "counters", "menuItems");
        try {
            return await runTransaction(db, async (transaction) => {
                const counterDoc = await transaction.get(counterRef);
                let currentId = 0;
                if (counterDoc.exists()) {
                    currentId = counterDoc.data().currentId;
                }
                const nextId = currentId + count;
                transaction.set(counterRef, { currentId: nextId });
                return currentId + 1; // Return the *start* of the new range
            });
        } catch (e) {
            console.error("Failed to get next ID:", e);
            return null;
        }
    };

    // Helper to add item to defaults/templates has been removed as it was unused.
    // Logic is now inlined in addItem.

    const addItem = async (input: MenuItemInput) => {
        const startId = await getNextIds(1);
        if (!startId) return false;

        const id = `ITEM-${String(startId).padStart(3, '0')}`;
        const itemData = {
            ...input,
            soldQuantity: 0,
            available: true,
            preparedDate: new Date().toISOString().split('T')[0],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        try {
            const batch = writeBatch(db);
            const docRef = doc(db, "menuItems", id);
            batch.set(docRef, itemData);

            // Also save to defaults/templates if it doesn't exist?
            // User requirement: "saved in default menu".
            // We use a separate collection 'menuTemplates'. 
            // We use a deterministic ID for template based on sanitized name to prevent partial dupes
            const templateId = `TPL-${input.name.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
            const templateRef = doc(db, "menuTemplates", templateId);
            batch.set(templateRef, { ...input, updatedAt: serverTimestamp() }, { merge: true });

            await batch.commit();
            return true;
        } catch (err) {
            console.error("Error adding item:", err);
            return false;
        }
    };

    /**
     * Restore key items from the 'menuTemplates' collection.
     * If 'menuTemplates' is empty, it seeds from the provided hardcoded defaults first.
     */
    const restoreDefaults = async (hardcodedDefaults: MenuItemInput[]) => {
        try {
            // 1. Fetch all templates
            const templatesSnapshot = await getDocs(collection(db, "menuTemplates"));
            let sourceItems: MenuItemInput[] = [];

            if (templatesSnapshot.empty) {
                // Seed templates from hardcoded defaults
                console.log("Seeding templates from code...");
                const batch = writeBatch(db);
                hardcodedDefaults.forEach(item => {
                    const templateId = `TPL-${item.name.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
                    const ref = doc(db, "menuTemplates", templateId);
                    batch.set(ref, { ...item, updatedAt: serverTimestamp() });
                });
                await batch.commit();
                sourceItems = hardcodedDefaults;
            } else {
                sourceItems = templatesSnapshot.docs.map(d => {
                    const data = d.data();
                    return {
                        name: data.name,
                        category: data.category,
                        price: data.price,
                        preparedQuantity: data.preparedQuantity
                    } as MenuItemInput;
                });
            }

            // 2. Identify duplicates in ACTIVE menu to avoid double-adding
            const existingNames = new Set(items.map(i => i.name.toLowerCase()));
            const itemsToAdd = sourceItems.filter(item =>
                !existingNames.has(item.name.toLowerCase())
            );

            const skippedCount = sourceItems.length - itemsToAdd.length;

            if (itemsToAdd.length === 0) {
                return { success: true, added: 0, skipped: skippedCount };
            }

            // 3. Add new items to ACTIVE menu
            const startId = await getNextIds(itemsToAdd.length);
            if (!startId) return { success: false, added: 0, skipped: skippedCount };

            const batch = writeBatch(db);
            const preparedDate = new Date().toISOString().split('T')[0];

            itemsToAdd.forEach((item, index) => {
                const id = `ITEM-${String(startId + index).padStart(3, '0')}`;
                const docRef = doc(db, "menuItems", id);
                batch.set(docRef, {
                    ...item,
                    soldQuantity: 0,
                    available: true,
                    preparedDate,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            });

            await batch.commit();
            return { success: true, added: itemsToAdd.length, skipped: skippedCount };

        } catch (err) {
            console.error("Error restoring defaults:", err);
            return { success: false, added: 0, skipped: 0 };
        }
    };

    return { items, loading, error, addItem, updateItem, toggleAvailability, restoreDefaults, deleteItem };
}
