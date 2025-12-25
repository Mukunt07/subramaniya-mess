import { format } from "date-fns";
import type { BillItem } from "./types";
import type { Settings } from "../settings/types";

interface ReceiptTemplateProps {
    items: BillItem[];
    subtotal: number;
    gstAmount: number;
    totalAmount: number;
    settings: Settings;
    sample?: boolean; // If true, show sample data for preview
}

export default function ReceiptTemplate({
    items,
    subtotal,
    gstAmount,
    totalAmount,
    settings,
    sample = false
}: ReceiptTemplateProps) {
    const displayItems = sample && items.length === 0 ? [
        { name: "Sample Item 1", quantity: 2, price: 50, itemId: "1", total: 100 },
        { name: "Sample Item 2", quantity: 1, price: 30, itemId: "2", total: 30 }
    ] : items;

    const displaySubtotal = sample && items.length === 0 ? 130 : subtotal;
    const displayGst = sample && items.length === 0 ? 6.5 : gstAmount;
    const displayTotal = sample && items.length === 0 ? 136.5 : totalAmount;

    return (
        <div className="bg-white font-mono text-sm leading-relaxed text-stone-900 w-full">
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold uppercase tracking-wider mb-1">{settings.restaurantName}</h2>
                <p className="text-xs text-stone-500 whitespace-pre-wrap">{settings.address || "Address Line 1, City"}</p>
                <p className="text-xs text-stone-500">Tel: {settings.phone || "+91 XXXXX XXXXX"}</p>
            </div>

            {/* Meta */}
            <div className="mb-4 text-xs flex justify-between uppercase">
                <span>Date: {format(new Date(), "dd-MM-yyyy")}</span>
                <span>Time: {format(new Date(), "HH:mm")}</span>
            </div>

            <div className="border-b border-dashed border-stone-300 mb-4" />

            {/* Items Header */}
            <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-bold uppercase">
                <div className="col-span-1">Q</div>
                <div className="col-span-7">Item</div>
                <div className="col-span-4 text-right">Price</div>
            </div>

            {/* Items List */}
            <div className="space-y-2 mb-4 min-h-[50px]">
                {displayItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 text-xs">
                        <div className="col-span-1 font-bold">{item.quantity}</div>
                        <div className="col-span-7 uppercase truncate">{item.name}</div>
                        <div className="col-span-4 text-right">
                            {(item.price * item.quantity).toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-b border-dashed border-stone-300 mb-4" />

            {/* Totals */}
            <div className="space-y-1 text-right">
                <div className="flex justify-between text-xs">
                    <span>Subtotal</span>
                    <span>{displaySubtotal.toFixed(2)}</span>
                </div>
                {settings.gstPercentage > 0 && (
                    <div className="flex justify-between text-xs">
                        <span>GST ({settings.gstPercentage}%)</span>
                        <span>{displayGst.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-lg mt-2 border-t border-dashed border-stone-300 pt-2">
                    <span>TOTAL</span>
                    <span>₹{displayTotal.toFixed(2)}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs space-y-1 whitespace-pre-wrap">
                {settings.billFooter || "THANK YOU FOR YOUR VISIT\nHAVE A NICE DAY"}
            </div>
        </div>
    );
}
