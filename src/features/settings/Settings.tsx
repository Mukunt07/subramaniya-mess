import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useSettings } from "./useSettings";
import { Save, Loader2, DollarSign, Store, Hash, AlertTriangle } from "lucide-react";

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

    if (loading) {
        return (
            <LoadingSpinner text="Loading Settings..." />
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">Settings</h1>
                <p className="text-stone-500 text-sm mt-1 font-medium">Manage your restaurant configuration</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="p-6 space-y-8">
                    {/* Restaurant Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                            <Store className="w-5 h-5 text-emerald-600" />
                            Restaurant Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-stone-700 mb-1">Restaurant Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.restaurantName}
                                    onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                                    className="w-full rounded-lg border-stone-300 border p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-stone-100" />

                    {/* Currency & Tax */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                            Currency & Tax
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Currency Symbol</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full rounded-lg border-stone-300 border p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">GST Percentage (%)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={formData.gstPercentage}
                                    onChange={(e) => setFormData({ ...formData, gstPercentage: parseFloat(e.target.value) })}
                                    className="w-full rounded-lg border-stone-300 border p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-stone-100" />

                    {/* Stock & Billing */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                            <Hash className="w-5 h-5 text-emerald-600" />
                            Stock & Billing
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Low Stock Threshold
                                    <span className="text-xs text-gray-500 ml-2">(Global)</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.lowStockThreshold}
                                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) })}
                                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number Prefix</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.billPrefix}
                                    onChange={(e) => setFormData({ ...formData, billPrefix: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                    placeholder="e.g. BILL"
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="autoDisable"
                                        checked={formData.autoDisableStock}
                                        onChange={(e) => setFormData({ ...formData, autoDisableStock: e.target.checked })}
                                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                    />
                                    <label htmlFor="autoDisable" className="text-sm font-medium text-gray-900 cursor-pointer">
                                        Auto-disable items when out of stock
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">
                                    When enabled, menu items will automatically be marked as unavailable when their remaining quantity reaches zero.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-stone-50 px-6 py-4 flex items-center justify-between border-t border-stone-200">
                    <span className="text-sm text-emerald-600 font-medium">{successMsg}</span>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
