import { Timestamp } from "firebase/firestore";

export type PaymentMode = "Cash" | "UPI" | "Card";

export interface BillItem {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
}

export interface Bill {
    id?: string;
    billNumber: string;
    items: BillItem[];
    subtotal: number;
    gstAmount: number;
    totalAmount: number;
    paymentMode: PaymentMode;
    date: Timestamp;
    status: "Completed" | "Cancelled";
}
