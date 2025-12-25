import { useState } from "react";
import { useMenu } from "./useMenu";
import { Plus, Search, Edit2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import type { MenuItem, MenuItemCategory, MenuItemInput } from "./types";
import { MENU_CATEGORIES } from "./types";
import { cn } from "../../lib/utils";

export default function MenuPage() {
    const { items, loading, addItem, updateItem, toggleAvailability } = useMenu();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    // Form State
    const [formData, setFormData] = useState<MenuItemInput>({
        name: "",
        category: "Breakfast",
        price: 0,
        preparedQuantity: 0,
    });

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let success = false;

        if (editingItem) {
            success = await updateItem(editingItem.id, {
                name: formData.name,
                category: formData.category,
                price: Number(formData.price),
                preparedQuantity: Number(formData.preparedQuantity),
            });
        } else {
            success = await addItem({
                name: formData.name,
                category: formData.category,
                price: Number(formData.price),
                preparedQuantity: Number(formData.preparedQuantity),
            });
        }

        if (success) {
            closeModal();
        }
    };

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({ name: "", category: "Breakfast", price: 0, preparedQuantity: 20 });
        setIsModalOpen(true);
    };

    const openEditModal = (item: MenuItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            category: item.category,
            price: item.price,
            preparedQuantity: item.preparedQuantity,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    if (loading) return <div className="p-8">Loading menu...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Menu & Stock</h1>
                    <p className="text-gray-500 mt-1">Manage food items, prices, and daily stock</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add New Item
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search items by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => {
                    const remaining = item.preparedQuantity - item.soldQuantity;
                    const isLowStock = remaining < 10 && remaining > 0; // Hardcoded generic threshold for UI, proper one in settings
                    const isOutOfStock = remaining <= 0;

                    return (
                        <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                        {item.category}
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                                <div className="text-2xl font-bold text-emerald-600 mb-4">₹{item.price}</div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Stock Status</span>
                                        <button
                                            onClick={() => toggleAvailability(item.id, item.available)}
                                            className={cn(
                                                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-xs transition-colors",
                                                item.available
                                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                            )}
                                        >
                                            {item.available ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                            {item.available ? "Available" : "Unavailable"}
                                        </button>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Prepared</span>
                                            <span className="font-medium text-gray-900">{item.preparedQuantity}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Sold</span>
                                            <span className="font-medium text-gray-900">{item.soldQuantity}</span>
                                        </div>
                                        <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Remaining</span>
                                            <span className={cn(
                                                "font-bold",
                                                isOutOfStock ? "text-red-600" : isLowStock ? "text-orange-600" : "text-emerald-600"
                                            )}>
                                                {remaining}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Progress bar for stock */}
                            <div className="h-1.5 w-full bg-gray-100">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-500",
                                        isOutOfStock ? "bg-red-500" : isLowStock ? "bg-orange-500" : "bg-emerald-500"
                                    )}
                                    style={{ width: `${Math.min(100, (remaining / item.preparedQuantity) * 100)}%` }} // Simple calc
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <div className="flex justify-center mb-4">
                        <Search className="w-12 h-12 text-gray-300" />
                    </div>
                    <p>No items found matching "{searchTerm}"</p>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingItem ? "Edit Item" : "New Menu Item"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <XCircle className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                    placeholder="e.g. Masala Dosa"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as MenuItemCategory })}
                                        className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-emerald-500/50 outline-none bg-white"
                                    >
                                        {MENU_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Daily Prepared Quantity
                                    <span className="text-xs text-gray-500 ml-2">(Resets count)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.preparedQuantity}
                                        onChange={(e) => setFormData({ ...formData, preparedQuantity: parseInt(e.target.value) })}
                                        className="w-full rounded-lg border-gray-300 border p-2.5 pl-10 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Qty</div>
                                </div>
                                {editingItem && (
                                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Updating this will overwrite total stock
                                    </p>
                                )}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
                                >
                                    {editingItem ? "Save Changes" : "Create Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
