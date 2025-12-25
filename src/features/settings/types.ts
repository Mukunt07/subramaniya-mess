import { Timestamp } from "firebase/firestore";

export interface Settings {
    restaurantName: string;
    gstPercentage: number;
    currency: string;
    lowStockThreshold: number;
    billPrefix: string;
    autoDisableStock: boolean;
    updatedAt: Timestamp;
}

export const DEFAULT_SETTINGS: Settings = {
    restaurantName: "My Veg Restaurant",
    gstPercentage: 5,
    currency: "₹",
    lowStockThreshold: 10,
    billPrefix: "VEG-",
    autoDisableStock: true,
    updatedAt: Timestamp.now(),
};
