import { useState } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useMenu } from "./useMenu";
import { Plus, Search, Edit2, AlertCircle, CheckCircle2, XCircle, Trash2, Database, ArrowUpDown } from "lucide-react";
import type { MenuItem, MenuItemCategory, MenuItemInput } from "./types";
import { MENU_CATEGORIES } from "./types";
import { cn } from "../../lib/utils";
import { DEFAULT_MENU_ITEMS } from "./defaultMenu";

export default function MenuPage() {
    const { items, loading, addItem, updateItem, toggleAvailability, restoreDefaults, deleteItem } = useMenu();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"All" | MenuItemCategory>("All");
    const [sortOption, setSortOption] = useState<"name-asc" | "name-desc" | "price-asc" | "price-desc">("name-asc");
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    const handleSeedMenu = async () => {
        if (!confirm("Are you sure you want to initialize the default menu items?")) return;

        const result = await restoreDefaults(DEFAULT_MENU_ITEMS);
        if (result && result.success) {
            alert(`Process Completed!\n\nAdded: ${result.added} new items\nSkipped: ${result.skipped} duplicates`);
        } else {
            alert("Failed to add default items. Please try again.");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;

        const success = await deleteItem(id, name);
        if (success) {
            // Toast success?
        } else {
            alert("Failed to delete item.");
        }
    };

    // Form State
    const [formData, setFormData] = useState<MenuItemInput>({
        name: "",
        category: "Breakfast",
        price: 0,
        preparedQuantity: 0,
    });

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase());

        // If user is searching, show results from ALL categories (ignore tab)
        if (searchTerm) return matchesSearch;

        const matchesTab = activeTab === "All" || item.category === activeTab;
        return matchesTab;
    }).sort((a, b) => {
        switch (sortOption) {
            case "name-asc":
                return a.name.localeCompare(b.name);
            case "name-desc":
                return b.name.localeCompare(a.name);
            case "price-asc":
                return a.price - b.price;
            case "price-desc":
                return b.price - a.price;
            default:
                return 0;
        }
    });

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

    if (loading) return <LoadingSpinner text="Fetching Menu Items..." />;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">Menu & Stock</h1>
                    <p className="text-stone-500 text-sm mt-1 font-medium">Manage food items, prices, and daily stock</p>
                </div>
                <button
                    onClick={handleSeedMenu}
                    className="bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors mr-3"
                    title="Populate with default items"
                >
                    <Database className="w-5 h-5" />
                    Load Defaults
                </button>
                <button
                    onClick={openAddModal}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add New Item
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 space-y-4">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 pb-2">
                    {["All", ...MENU_CATEGORIES].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                activeTab === tab
                                    ? "bg-stone-900 text-white shadow-md shadow-stone-900/20"
                                    : "bg-white text-stone-500 hover:bg-stone-100 border border-stone-200"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search items by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <div className="relative w-48">
                        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as any)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none bg-white cursor-pointer"
                        >
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="price-asc">Price (Low-High)</option>
                            <option value="price-desc">Price (High-Low)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredItems.map((item) => {
                    const remaining = item.preparedQuantity - item.soldQuantity;
                    const isLowStock = remaining < 10 && remaining > 0;
                    const isOutOfStock = remaining <= 0;

                    return (
                        <div key={item.id} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition-all group aspect-square flex flex-col relative">
                            <div className="p-3 flex flex-col h-full">
                                {/* Top: Category & Actions */}
                                <div className="flex justify-between items-start">
                                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600 tracking-tight">
                                        {item.category}
                                    </span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="p-1 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                                            title="Edit Item"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id, item.name)}
                                            className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded"
                                            title="Delete Item"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Center: Info */}
                                <div className="flex-1 flex flex-col justify-center items-center text-center -mt-1">
                                    <h3 className="font-bold text-stone-900 text-lg leading-tight mb-1 line-clamp-2" title={item.name}>{item.name}</h3>
                                    <div className="text-xl font-bold text-emerald-600">₹{item.price}</div>
                                </div>

                                {/* Bottom: Stats & Toggle */}
                                <div className="mt-auto space-y-2">
                                    {/* Mini Stats Row */}
                                    <div className="flex justify-center divide-x divide-stone-200 text-[10px] text-stone-500">
                                        <div className="px-2">Prep <span className="font-semibold text-stone-900">{item.preparedQuantity}</span></div>
                                        <div className="px-2">Sold <span className="font-semibold text-stone-900">{item.soldQuantity}</span></div>
                                        <div className="px-2">Rem <span className={cn("font-bold", isOutOfStock ? "text-red-600" : "text-emerald-600")}>{remaining}</span></div>
                                    </div>

                                    <button
                                        onClick={() => toggleAvailability(item.id, item.available)}
                                        className={cn(
                                            "w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors border",
                                            item.available
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                                                : "bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100"
                                        )}
                                    >
                                        {item.available ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                        {item.available ? "AVAILABLE" : "UNAVAILABLE"}
                                    </button>
                                </div>
                            </div>

                            {/* Stock Bar */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-500",
                                        isOutOfStock ? "bg-red-500" : isLowStock ? "bg-orange-500" : "bg-emerald-500"
                                    )}
                                    style={{ width: `${Math.min(100, (remaining / item.preparedQuantity) * 100)}%` }}
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
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                            <h2 className="text-xl font-semibold text-stone-900 tracking-tight">
                                {editingItem ? "Edit Item" : "New Menu Item"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-stone-200 rounded-full transition-colors"
                            >
                                <XCircle className="w-6 h-6 text-stone-400" />
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
