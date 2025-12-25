import { useState } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useOrders } from "./useOrders";
import { format } from "date-fns";
import { Search, FileX } from "lucide-react";
import { cn } from "../../lib/utils";
import type { PaymentMode } from "../billing/types";

export default function OrdersPage() {
    const { orders, loading, cancelOrder } = useOrders();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"All" | "Completed" | "Cancelled">("All");
    const [paymentFilter, setPaymentFilter] = useState<"All" | PaymentMode>("All");

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === "All" || order.status === statusFilter;
        const matchesPayment = paymentFilter === "All" || order.paymentMode === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
    });

    const handleCancel = async (id: string) => {
        if (confirm("Are you sure you want to cancel this bill? Stock will be reverted.")) {
            await cancelOrder(id);
        }
    };

    if (loading) return <LoadingSpinner text="Loading Orders History..." />;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">Orders History</h1>
                <p className="text-stone-500 text-sm mt-1 font-medium">View and manage past bills</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Bill # or Item name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium bg-gray-50 outline-none focus:border-emerald-500"
                    >
                        <option value="All">All Status</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value as any)}
                        className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium bg-gray-50 outline-none focus:border-emerald-500"
                    >
                        <option value="All">All Payments</option>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-stone-50 border-b border-stone-200">
                            <tr>
                                <th className="px-6 py-4 font-medium text-stone-600 text-sm">Bill No</th>
                                <th className="px-6 py-4 font-medium text-stone-600 text-sm">Date & Time</th>
                                <th className="px-6 py-4 font-medium text-stone-600 text-sm">Items</th>
                                <th className="px-6 py-4 font-medium text-stone-600 text-sm">Total</th>
                                <th className="px-6 py-4 font-medium text-stone-600 text-sm">Payment</th>
                                <th className="px-6 py-4 font-medium text-stone-600 text-sm">Status</th>
                                <th className="px-6 py-4 font-medium text-stone-600 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-stone-900">{order.billNumber}</td>
                                    <td className="px-6 py-4 text-sm text-stone-500">
                                        {order.date ? format(order.date.toDate(), "dd MMM, hh:mm a") : "-"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-stone-600 max-w-xs truncate">
                                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-stone-900">₹{order.totalAmount}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-xs font-medium text-stone-600">
                                            {order.paymentMode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-xs font-medium border",
                                            order.status === "Completed"
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                : "bg-red-50 text-red-700 border-red-100"
                                        )}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {order.status === "Completed" && (
                                            <button
                                                onClick={() => handleCancel(order.id!)}
                                                className="text-stone-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Cancel Bill"
                                            >
                                                <FileX className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-stone-500">
                                        No orders found matching your filters
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
