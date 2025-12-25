import { format } from "date-fns";
import { X, Printer } from "lucide-react";
import type { BillItem } from "./types";
import { cn } from "../../lib/utils";

interface ReceiptModalProps {
    items: BillItem[];
    subtotal: number;
    gstAmount: number;
    totalAmount: number;
    onConfirm: () => void;
    onClose: () => void;
    loading: boolean;
}

export default function ReceiptModal({
    items,
    subtotal,
    gstAmount,
    totalAmount,
    onConfirm,
    onClose,
    loading
}: ReceiptModalProps) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header Actions */}
                <div className="flex justify-between items-center p-3 bg-stone-100 border-b border-stone-200">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Bill Preview</span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => window.print()}
                            className="p-1.5 hover:bg-emerald-100 hover:text-emerald-700 rounded-full transition-colors text-stone-500"
                            title="Print Receipt"
                        >
                            <Printer className="w-4 h-4" />
                        </button>
                        <button onClick={onClose} className="p-1 hover:bg-stone-200 rounded-full transition-colors">
                            <X className="w-5 h-5 text-stone-500" />
                        </button>
                    </div>
                </div>

                {/* Receipt Content (Scrollable) */}
                <div className="overflow-y-auto p-6 bg-white font-mono text-sm leading-relaxed text-stone-900">
                    {/* ... content ... */}
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold uppercase tracking-wider mb-1">Subramaniya Mess</h2>
                        <p className="text-xs text-stone-500">123, South Car Street, Tenkasi</p>
                        <p className="text-xs text-stone-500">Tel: +91 98765 43210</p>
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
                    <div className="space-y-2 mb-4">
                        {items.map((item, idx) => (
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
                            <span>{subtotal.toFixed(2)}</span>
                        </div>
                        {gstAmount > 0 && (
                            <div className="flex justify-between text-xs">
                                <span>GST (5%)</span>
                                <span>{gstAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg mt-2 border-t border-dashed border-stone-300 pt-2">
                            <span>TOTAL</span>
                            <span>₹{totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-xs space-y-1">
                        <p>THANK YOU FOR YOUR VISIT</p>
                        <p>HAVE A NICE DAY</p>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-stone-50 border-t border-stone-200 flex gap-3">
                    <button
                        className="flex-1 py-3 bg-white text-stone-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-stone-100 hover:text-red-600 border border-stone-200 transition-colors uppercase text-xs tracking-wider"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={cn(
                            "flex-[2] py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg uppercase text-sm tracking-wide",
                            loading ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30"
                        )}
                    >
                        {loading ? "Processing..." : `PAID ₹${totalAmount}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
