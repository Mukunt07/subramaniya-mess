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
    createdAt: Timestamp;
}

export interface MenuItemInput {
    name: string;
    category: MenuItemCategory;
    price: number;
    preparedQuantity: number;
    // available is auto-derived or manual toggle
}
