export interface Settings {
    restaurantName: string;
    gstPercentage: number;
    currency: string;
    lowStockThreshold: number;
    billPrefix: string;
    autoDisableStock: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
    restaurantName: "My Veg Restaurant",
    gstPercentage: 5,
    currency: "₹",
    lowStockThreshold: 10,
    billPrefix: "BILL",
    autoDisableStock: true,
};
