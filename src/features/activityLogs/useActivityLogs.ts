import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { ActivityAction } from "./types";

export function useActivityLogs() {
    const logActivity = async (action: ActivityAction, referenceId: string, details: string) => {
        try {
            await addDoc(collection(db, "activityLogs"), {
                action,
                referenceId,
                details,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Failed to log activity:", error);
        }
    };

    return { logActivity };
}
