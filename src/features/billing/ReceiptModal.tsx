import { X, Printer } from "lucide-react";
import type { BillItem } from "./types";
import { cn } from "../../lib/utils";
import ReceiptTemplate from "./ReceiptTemplate";
import { useSettings } from "../settings/useSettings";

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
    const { settings } = useSettings();

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
                <div className="overflow-y-auto p-6 bg-white">
                    <ReceiptTemplate
                        items={items}
                        subtotal={subtotal}
                        gstAmount={gstAmount}
                        totalAmount={totalAmount}
                        settings={settings}
                    />
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
