import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useSettings } from "./useSettings";
import ReceiptTemplate from "../billing/ReceiptTemplate";
import { Save, Loader2, Store, Hash, Receipt } from "lucide-react";

export default function SettingsPage() {
    const { settings, loading, saving, updateSettings } = useSettings();
    const [formData, setFormData] = useState(settings);
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        if (!loading) setFormData(settings);
    }, [loading, settings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await updateSettings(formData);
        if (success) {
            setSuccessMsg("Settings saved successfully!");
            setTimeout(() => setSuccessMsg(""), 3000);
        }
    };

    if (loading) return <LoadingSpinner text="Loading Settings..." />;

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">Settings</h1>
                <p className="text-stone-500 text-sm mt-1 font-medium">Manage your restaurant configuration & bill layout</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Column */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                        <div className="p-6 space-y-8">
                            {/* Restaurant Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                                    <Store className="w-5 h-5 text-emerald-600" />
                                    Restaurant Details
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Restaurant Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.restaurantName}
                                        onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                                        className="w-full rounded-lg border-stone-300 border p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                            </div>

                            <hr className="border-stone-100" />

                            {/* Bill Configuration (New) */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-emerald-600" />
                                    Bill Layout Cofiguration
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">Address Line</label>
                                        <textarea
                                            rows={2}
                                            value={formData.address || ""}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full rounded-lg border-stone-300 border p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                            placeholder="e.g. 123, South Car Street, Tenkasi"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
                                            <input
                                                type="text"
                                                value={formData.phone || ""}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full rounded-lg border-stone-300 border p-2.5 outline-none focus:border-emerald-500"
                                                placeholder="+91 XXXXX XXXXX"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Currency Symbol</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.currency}
                                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                                className="w-full rounded-lg border-stone-300 border p-2.5 outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">Footer Message</label>
                                        <textarea
                                            rows={2}
                                            value={formData.billFooter || ""}
                                            onChange={(e) => setFormData({ ...formData, billFooter: e.target.value })}
                                            className="w-full rounded-lg border-stone-300 border p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                            placeholder="Thank you message..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-stone-100" />

                            {/* Other Settings (Collapsed/Simplified) */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                                    <Hash className="w-5 h-5 text-emerald-600" />
                                    stock & Tax
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">GST %</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={formData.gstPercentage}
                                            onChange={(e) => setFormData({ ...formData, gstPercentage: parseFloat(e.target.value) })}
                                            className="w-full rounded-lg border-stone-300 border p-2.5 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">Bill Prefix</label>
                                        <input
                                            type="text"
                                            value={formData.billPrefix}
                                            onChange={(e) => setFormData({ ...formData, billPrefix: e.target.value })}
                                            className="w-full rounded-lg border-stone-300 border p-2.5 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.autoDisableStock}
                                        onChange={(e) => setFormData({ ...formData, autoDisableStock: e.target.checked })}
                                        className="rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm text-stone-600">Auto-disable items when out of stock</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="bg-stone-50 px-6 py-4 flex items-center justify-between border-t border-stone-200">
                            <span className="text-sm text-emerald-600 font-medium animate-in slide-in-from-left-2 fade-in">{successMsg}</span>
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>

                {/* Preview Column (Sticky) */}
                <div className="hidden lg:block">
                    <div className="sticky top-6 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded tracking-wider uppercase">Live Preview</span>
                            <span className="text-stone-400 text-xs">Updates as you type</span>
                        </div>

                        <div className="bg-stone-100 p-8 rounded-2xl border border-stone-200 shadow-inner flex justify-center">
                            <div className="bg-white shadow-xl rotate-1 transition-transform hover:rotate-0 duration-500 w-[350px]">
                                <div className="px-6 py-8">
                                    <ReceiptTemplate
                                        items={[]}
                                        subtotal={0}
                                        gstAmount={0}
                                        totalAmount={0}
                                        settings={formData}
                                        sample={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
