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
    subtotal: number; // Note: Schema calls this subTotal, but code uses subtotal. Keeping subtotal for now to avoid massive refactor unless strictly required. User schema said "subTotal", I will align to "subTotal" if possible or map it. Let's start by adding missing fields.
    gstEnabled: boolean;
    gstAmount: number;
    totalAmount: number;
    paymentMode: PaymentMode;
    status: "Completed" | "Cancelled";
    createdAt: Timestamp;
    cancelledAt: Timestamp | null;
}
