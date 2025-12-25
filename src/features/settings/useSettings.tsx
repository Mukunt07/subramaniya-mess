import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { Settings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

export function useSettings() {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const docRef = doc(db, "settings", "config");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setSettings(docSnap.data() as Settings);
            } else {
                // Create default settings if not exists
                await setDoc(docRef, DEFAULT_SETTINGS);
                setSettings(DEFAULT_SETTINGS);
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
            setError("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings: Settings) => {
        try {
            setSaving(true);
            setError(null);
            const docRef = doc(db, "settings", "config");
            await setDoc(docRef, newSettings);
            setSettings(newSettings);
            return true;
        } catch (err) {
            console.error("Error saving settings:", err);
            setError("Failed to save settings");
            return false;
        } finally {
            setSaving(false);
        }
    };

    return { settings, loading, saving, error, updateSettings };
}
