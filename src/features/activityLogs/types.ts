import { Timestamp } from "firebase/firestore";

export type ActivityAction =
    | "STOCK_UPDATED"
    | "ITEM_TOGGLED"
    | "BILL_CREATED"
    | "BILL_CANCELLED"
    | "SETTINGS_UPDATED";

export interface ActivityLog {
    id?: string;
    action: ActivityAction;
    referenceId: string; // menuItemId / orderId
    details: string;
    createdAt: Timestamp;
}
