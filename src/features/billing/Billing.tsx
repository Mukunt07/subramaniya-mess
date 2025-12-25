import { useState, useMemo } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useMenu } from "../menu/useMenu";
import { useBilling } from "./useBilling";
import { useSettings } from "../settings/useSettings";
import { Search, Trash2, CreditCard, Banknote, Smartphone, ShoppingBag } from "lucide-react";
import type { MenuItem } from "../menu/types";
import type { BillItem, PaymentMode } from "./types";
import { cn } from "../../lib/utils";

export default function BillingPage() {
    const { items: menuItems } = useMenu(); // Assume real-time
    const { createBill, loading } = useBilling();
    const { settings } = useSettings();

    if (loading) return <LoadingSpinner text="Processing..." />;

    const [searchTerm, setSearchTerm] = useState("");
    const [cart, setCart] = useState<BillItem[]>([]);
    const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");
    const [gstEnabled, setGstEnabled] = useState(true);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Derived
    const filteredMenu = useMemo(() => {
        return menuItems.filter(item =>
            item.available && // Only show available
            (item.preparedQuantity - item.soldQuantity > 0) && // Only show in stock
            (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [menuItems, searchTerm]);

    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const gstAmount = gstEnabled ? (subtotal * settings.gstPercentage) / 100 : 0;
    const totalAmount = Math.round(subtotal + gstAmount);

    // Handlers
    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.itemId === item.id);
            const remainingStock = item.preparedQuantity - item.soldQuantity;

            if (existing) {
                if (existing.quantity >= remainingStock) return prev; // Cannot add more than stock
                return prev.map(i =>
                    i.itemId === item.id
                        ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
                        : i
                );
            } else {
                return [...prev, {
                    itemId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                    total: item.price
                }];
            }
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.itemId !== itemId));
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.itemId !== itemId) return item;
                const menuItem = menuItems.find(m => m.id === itemId);
                if (!menuItem) return item;

                const newQty = item.quantity + delta;
                const remainingStock = menuItem.preparedQuantity - menuItem.soldQuantity;

                if (newQty < 1) return item; // Don't allow 0, use remove
                if (newQty > remainingStock) return item; // Check stock limit

                return { ...item, quantity: newQty, total: newQty * item.price };
            });
        });
    };

    const handleCheckout = async () => {
        setErrorMsg("");
        setSuccessMsg("");
        if (cart.length === 0) return;

        const result = await createBill(cart, paymentMode, gstEnabled);
        if (result.success) {
            setSuccessMsg("Order placed successfully!");
            setCart([]);
            setTimeout(() => setSuccessMsg(""), 3000);
        } else {
            setErrorMsg(result.error || "Failed to place order");
        }
    };

    return (
        <div className="flex h-[calc(100vh-theme(spacing.16))] overflow-hidden">
            {/* Left: Menu Selection */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-stone-800 mb-4 tracking-tight">New Order</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search available items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white shadow-sm transition-all"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredMenu.map(item => {
                        const remaining = item.preparedQuantity - item.soldQuantity;
                        return (
                            <button
                                key={item.id}
                                onClick={() => addToCart(item)}
                                className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:shadow-md hover:border-emerald-500 hover:ring-1 hover:ring-emerald-500 transition-all text-left group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                                        {item.category}
                                    </span>
                                    <span className={cn("text-xs font-semibold", remaining < 5 ? "text-orange-600" : "text-emerald-600")}>
                                        {remaining} left
                                    </span>
                                </div>
                                <h3 className="font-semibold text-stone-900 line-clamp-1 group-hover:text-emerald-700 tracking-tight">{item.name}</h3>
                                <p className="text-stone-500 font-medium mt-1">₹{item.price}</p>
                            </button>
                        );
                    })}
                </div>
                {filteredMenu.length === 0 && (
                    <div className="text-center py-10 text-stone-400">No available items found</div>
                )}
            </div>

            {/* Right: Cart & Checkout */}
            <div className="w-96 bg-white border-l border-stone-200 flex flex-col h-full shadow-xl">
                <div className="p-5 border-b border-stone-100 bg-stone-50">
                    <h2 className="font-semibold text-stone-900 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-emerald-600" />
                        Current Bill
                    </h2>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-2">
                            <ShoppingBag className="w-12 h-12 opacity-20" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.itemId} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-100">
                                <div className="flex-1">
                                    <h4 className="font-medium text-stone-900 text-sm">{item.name}</h4>
                                    <div className="text-xs text-stone-500">₹{item.price} x {item.quantity}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 bg-white rounded border border-stone-200">
                                        <button onClick={() => updateQuantity(item.itemId, -1)} className="px-2 py-0.5 hover:bg-stone-100">-</button>
                                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.itemId, 1)} className="px-2 py-0.5 hover:bg-stone-100">+</button>
                                    </div>
                                    <div className="text-sm font-semibold w-12 text-right text-stone-900">₹{item.total}</div>
                                    <button onClick={() => removeFromCart(item.itemId)} className="text-stone-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Checkout Section */}
                <div className="p-5 border-t border-stone-200 bg-stone-50">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-stone-600">
                            <span>Subtotal</span>
                            <span>₹{subtotal}</span>
                        </div>
                        {gstEnabled && (
                            <div className="flex justify-between text-sm text-stone-600">
                                <span>GST ({settings.gstPercentage}%)</span>
                                <span>₹{gstAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xl font-semibold text-stone-900 pt-2 border-t border-stone-200">
                            <span>Total</span>
                            <span>₹{totalAmount}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Payment Mode */}
                        <div className="grid grid-cols-3 gap-2">
                            {(["Cash", "UPI", "Card"] as const).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setPaymentMode(mode)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-2 rounded-lg border transition-all text-xs font-medium gap-1",
                                        paymentMode === mode
                                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400"
                                    )}
                                >
                                    {mode === "Cash" && <Banknote className="w-4 h-4" />}
                                    {mode === "UPI" && <Smartphone className="w-4 h-4" />}
                                    {mode === "Card" && <CreditCard className="w-4 h-4" />}
                                    {mode}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="gst"
                                checked={gstEnabled}
                                onChange={(e) => setGstEnabled(e.target.checked)}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <label htmlFor="gst" className="text-sm text-gray-700 select-none">Enable GST Bill</label>
                        </div>

                        {errorMsg && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{errorMsg}</div>}
                        {successMsg && <div className="text-emerald-600 text-sm text-center bg-green-50 p-2 rounded">{successMsg}</div>}

                        <button
                            onClick={handleCheckout}
                            disabled={loading || cart.length === 0}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                            {loading ? "Processing..." : `PAY ₹${totalAmount}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
