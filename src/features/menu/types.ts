import { Timestamp } from "firebase/firestore";

export type MenuItemCategory = "Breakfast" | "Lunch" | "Dinner" | "Snacks" | "Sweets";

export const MENU_CATEGORIES: MenuItemCategory[] = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snacks",
    "Sweets",
];

export interface MenuItem {
    id: string;
    name: string;
    category: MenuItemCategory;
    price: number;
    available: boolean;
    preparedQuantity: number;
    soldQuantity: number;
    preparedDate: string; // YYYY-MM-DD
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface MenuItemInput {
    name: string;
    category: MenuItemCategory;
    price: number;
    preparedQuantity: number;
    // soldQuantity derived (0 initially)
    // available derived (prepared > 0)
    // preparedDate derived (today)
    // timestamps derived
}
