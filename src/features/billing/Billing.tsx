import { useState, useMemo } from "react";
import { useMenu } from "../menu/useMenu";
import { useBilling } from "./useBilling";
import { useSettings } from "../settings/useSettings";
import { Search, Trash2, CreditCard, Banknote, Smartphone, ShoppingBag } from "lucide-react";
import type { MenuItem, MenuItemCategory } from "../menu/types";
import { MENU_CATEGORIES } from "../menu/types";
import type { BillItem, PaymentMode } from "./types";
import { cn } from "../../lib/utils";
import ReceiptModal from "./ReceiptModal";

export default function BillingPage() {
    const { items: menuItems } = useMenu();
    const { createBill, loading } = useBilling();
    const { settings } = useSettings();

    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption] = useState<"name-asc" | "name-desc" | "price-asc" | "price-desc">("name-asc");
    const [activeTab, setActiveTab] = useState<"All" | MenuItemCategory>("All");
    const [cart, setCart] = useState<BillItem[]>([]);
    const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");
    const [orderType, setOrderType] = useState<"Dine-in" | "Parcel">("Dine-in");
    const [gstEnabled, setGstEnabled] = useState(true);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [showReceipt, setShowReceipt] = useState(false);

    // Mobile Tab State
    const [mobileTab, setMobileTab] = useState<"menu" | "cart">("menu");

    // Derived State
    const subtotal = useMemo(() => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cart]);

    const gstAmount = useMemo(() => {
        return gstEnabled ? (subtotal * settings.gstPercentage) / 100 : 0;
    }, [subtotal, gstEnabled, settings.gstPercentage]);

    const totalAmount = useMemo(() => {
        return Math.round(subtotal + gstAmount);
    }, [subtotal, gstAmount]);

    const filteredItems = useMemo(() => {
        let items = menuItems;
        if (activeTab !== "All") {
            items = items.filter(item => item.category === activeTab);
        }
        if (searchTerm) {
            items = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return items.sort((a, b) => {
            if (sortOption === "name-asc") return a.name.localeCompare(b.name);
            if (sortOption === "name-desc") return b.name.localeCompare(a.name);
            if (sortOption === "price-asc") return a.price - b.price;
            return b.price - a.price;
        });
    }, [menuItems, activeTab, searchTerm, sortOption]);

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.itemId === item.id);
            if (existing) {
                return prev.map(i => i.itemId === item.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price } : i);
            }
            return [...prev, { itemId: item.id, name: item.name, price: item.price, quantity: 1, total: item.price }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => {
            const existing = prev.find(i => i.itemId === itemId);
            if (existing && existing.quantity > 1) {
                return prev.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity - 1, total: (i.quantity - 1) * i.price } : i);
            }
            return prev.filter(i => i.itemId !== itemId);
        });
    };

    const handleInitialPayClick = () => {
        setErrorMsg("");
        setSuccessMsg("");
        if (cart.length === 0) return;
        setShowReceipt(true);
    };

    const handleConfirmPay = async () => {
        const result = await createBill(cart, paymentMode, gstEnabled, orderType);
        if (result.success) {
            setSuccessMsg("Order placed successfully!");
            setCart([]);
            setShowReceipt(false);
            setTimeout(() => setSuccessMsg(""), 3000);
        } else {
            setErrorMsg(result.error || "Failed to place order");
            setShowReceipt(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row bg-stone-50 h-[calc(100vh-4rem)]">
            {/* Mobile Tab Switcher */}
            <div className="lg:hidden flex bg-white border-b border-stone-200">
                <button
                    onClick={() => setMobileTab("menu")}
                    className={cn(
                        "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
                        mobileTab === "menu" ? "border-emerald-500 text-emerald-600" : "border-transparent text-stone-500"
                    )}
                >
                    <Search className="w-4 h-4" /> Menu
                </button>
                <button
                    onClick={() => setMobileTab("cart")}
                    className={cn(
                        "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
                        mobileTab === "cart" ? "border-emerald-500 text-emerald-600" : "border-transparent text-stone-500"
                    )}
                >
                    <ShoppingBag className="w-4 h-4" />
                    Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
                </button>
            </div>

            {/* Left Column: Menu */}
            <div className={cn(
                "flex-1 flex flex-col min-w-0 transition-opacity duration-200",
                mobileTab === "cart" ? "hidden lg:flex" : "flex"
            )}>
                {/* Header & Filters */}
                <div className="p-6 bg-white border-b border-stone-200 shadow-sm z-10">
                    <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-medium text-stone-800 tracking-tight">New Order</h1>
                            <p className="text-stone-500 text-sm font-medium mt-1">Select items to add to bill</p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        <button
                            onClick={() => setActiveTab("All")}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all",
                                activeTab === "All"
                                    ? "bg-stone-800 text-white shadow-md"
                                    : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300"
                            )}
                        >
                            All Items
                        </button>
                        {MENU_CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all",
                                    activeTab === cat
                                        ? "bg-stone-800 text-white shadow-md"
                                        : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => addToCart(item)}
                                className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all text-left group flex flex-col h-full"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="px-2 py-1 rounded-md bg-stone-100 text-stone-500 text-xs font-medium uppercase tracking-wider">
                                        {item.category}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-stone-800 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-2">
                                    {item.name}
                                </h3>
                                <div className="mt-auto flex items-end justify-between">
                                    <span className="text-lg font-bold text-stone-900">₹{item.price}</span>
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        +
                                    </div>
                                </div>
                            </button>
                        ))}
                        {filteredItems.length === 0 && (
                            <div className="col-span-full h-40 flex items-center justify-center text-stone-400 font-medium">
                                No items found
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: Cart */}
            <div className={cn(
                "w-full lg:w-96 bg-white border-l border-stone-200 shadow-xl z-20 flex flex-col transition-all duration-200",
                mobileTab === "menu" ? "hidden lg:flex" : "flex h-full"
            )}>
                <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-white">
                    <h2 className="text-lg font-medium text-stone-800 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-emerald-600" />
                        Current Order
                    </h2>
                    <button
                        onClick={() => setCart([])}
                        disabled={cart.length === 0}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Clear Cart"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.map(item => (
                        <div key={item.itemId} className="flex gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100 group">
                            <div className="flex-1">
                                <h4 className="font-medium text-stone-800 text-sm line-clamp-1">{item.name}</h4>
                                <div className="text-xs text-stone-500 mt-1">₹{item.price} x {item.quantity}</div>
                            </div>
                            <div className="flex flex-col items-end justify-between gap-2">
                                <span className="font-semibold text-stone-900 text-sm">₹{item.total}</span>
                                <div className="flex items-center gap-2 bg-white rounded-lg border border-stone-200 px-1 py-0.5 shadow-sm">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFromCart(item.itemId); }}
                                        className="w-5 h-5 flex items-center justify-center rounded text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="text-xs font-semibold w-3 text-center">{item.quantity}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); addToCart({ id: item.itemId, name: item.name, price: item.price } as MenuItem); }}
                                        className="w-5 h-5 flex items-center justify-center rounded text-stone-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-3 opacity-60">
                            <ShoppingBag className="w-12 h-12" />
                            <p className="text-sm font-medium">Your cart is empty</p>
                        </div>
                    )}
                </div>

                {/* Checkout Section & Order Type Toggle */}
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
                        {/* Order Type Toggle */}
                        <div className="flex p-1 bg-stone-200 rounded-xl">
                            <button
                                onClick={() => setOrderType("Dine-in")}
                                className={cn(
                                    "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                                    orderType === "Dine-in" ? "bg-white text-emerald-700 shadow-sm" : "text-stone-500 hover:text-stone-700"
                                )}
                            >
                                Dine-in
                            </button>
                            <button
                                onClick={() => setOrderType("Parcel")}
                                className={cn(
                                    "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                                    orderType === "Parcel" ? "bg-white text-orange-600 shadow-sm" : "text-stone-500 hover:text-stone-700"
                                )}
                            >
                                Parcel
                            </button>
                        </div>

                        {/* Payment Mode */}
                        <div className="grid grid-cols-3 gap-2">
                            {(["Cash", "UPI", "Card"] as const).map(mode => {
                                const colorMap = {
                                    Cash: "bg-emerald-600 border-emerald-600 hover:bg-emerald-700",
                                    UPI: "bg-blue-600 border-blue-600 hover:bg-blue-700",
                                    Card: "bg-violet-600 border-violet-600 hover:bg-violet-700"
                                };
                                const hoverMap = {
                                    Cash: "hover:border-emerald-400 text-emerald-600 bg-emerald-50",
                                    UPI: "hover:border-blue-400 text-blue-600 bg-blue-50",
                                    Card: "hover:border-violet-400 text-violet-600 bg-violet-50"
                                };

                                return (
                                    <button
                                        key={mode}
                                        onClick={() => setPaymentMode(mode)}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-sm font-semibold gap-1.5 shadow-sm",
                                            paymentMode === mode
                                                ? `${colorMap[mode]} text-white shadow-md transform scale-105`
                                                : `bg-white border-stone-200 text-stone-600 ${hoverMap[mode]}`
                                        )}
                                    >
                                        {mode === "Cash" && <Banknote className="w-5 h-5" />}
                                        {mode === "UPI" && <Smartphone className="w-5 h-5" />}
                                        {mode === "Card" && <CreditCard className="w-5 h-5" />}
                                        {mode}
                                    </button>
                                );
                            })}
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
                            onClick={handleInitialPayClick}
                            disabled={loading || cart.length === 0}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                            {loading ? "Processing..." : `PAY ₹${totalAmount}`}
                        </button>
                    </div>
                </div>
            </div>

            {showReceipt && (
                <ReceiptModal
                    items={cart}
                    subtotal={subtotal}
                    gstAmount={gstAmount}
                    totalAmount={totalAmount}
                    loading={loading}
                    onConfirm={handleConfirmPay}
                    onClose={() => setShowReceipt(false)}
                    orderType={orderType}
                />
            )}
        </div>
    );
}
