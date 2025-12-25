import { Timestamp } from "firebase/firestore";

export interface Settings {
    restaurantName: string;
    gstPercentage: number;
    currency: string;
    lowStockThreshold: number;
    billPrefix: string;
    autoDisableStock: boolean;
    address: string;
    phone: string;
    billFooter: string;
    updatedAt: Timestamp;
}

export const DEFAULT_SETTINGS: Settings = {
    restaurantName: "My Veg Restaurant",
    gstPercentage: 5,
    currency: "₹",
    lowStockThreshold: 10,
    billPrefix: "VEG-",
    autoDisableStock: true,
    address: "123, Main Street, Your City",
    phone: "+91 98765 43210",
    billFooter: "THANK YOU FOR YOUR VISIT\nHAVE A NICE DAY",
    updatedAt: Timestamp.now(),
};
