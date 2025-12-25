import { useAnalytics } from "./useAnalytics";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { RefreshCcw, TrendingDown, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
    const { data, loading, refresh } = useAnalytics();

    if (loading) return <LoadingSpinner text="Crunching Numbers..." />;
    if (!data) return <div className="p-8">Failed to load data</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">Revenue & Analytics</h1>
                    <p className="text-stone-500 text-sm mt-1 font-medium">Historical data and wastage reports</p>
                </div>
                <button
                    onClick={refresh}
                    className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                >
                    <RefreshCcw className="w-5 h-5" />
                </button>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-stone-900 tracking-tight">Revenue (Last 7 Days)</h3>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.dailyRevenue}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                            <Tooltip
                                cursor={{ stroke: '#10B981', strokeWidth: 1 }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#10B981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Wastage Report */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-stone-900 tracking-tight">Today's Wastage</h3>
                            <p className="text-sm text-stone-500 font-medium">Unsold items (Potential Revenue Loss)</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-stone-500 font-medium">Total Loss</p>
                        <p className="text-xl font-semibold text-red-600">
                            ₹{data.wastage.reduce((sum, item) => sum + item.cost, 0)}
                        </p>
                    </div>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                            <th className="px-6 py-4 font-medium text-stone-600 text-sm">Item Name</th>
                            <th className="px-6 py-4 font-medium text-stone-600 text-sm text-center">Prepared</th>
                            <th className="px-6 py-4 font-medium text-stone-600 text-sm text-center">Sold</th>
                            <th className="px-6 py-4 font-medium text-stone-600 text-sm text-center">Unsold</th>
                            <th className="px-6 py-4 font-medium text-stone-600 text-sm text-right">Loss Amt</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {data.wastage.map((item, idx) => (
                            <tr key={idx} className="hover:bg-stone-50/50">
                                <td className="px-6 py-4 text-stone-900 font-medium">{item.name}</td>
                                <td className="px-6 py-4 text-stone-600 text-center">{item.prepared}</td>
                                <td className="px-6 py-4 text-stone-600 text-center">{item.sold}</td>
                                <td className="px-6 py-4 text-red-600 font-semibold text-center">{item.wastage}</td>
                                <td className="px-6 py-4 text-red-600 font-semibold text-right">₹{item.cost}</td>
                            </tr>
                        ))}
                        {data.wastage.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-green-600 font-medium bg-green-50/30">
                                    No wastage today! Great job! 🎉
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
