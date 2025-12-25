import { useDashboard } from "./useDashboard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import {
    IndianRupee,
    Receipt,
    TrendingUp,
    AlertTriangle,
    RefreshCcw,
    ArrowUpRight
} from "lucide-react";
import { cn } from "../../lib/utils";

const PAYMENT_COLORS: Record<string, string> = {
    Cash: '#059669', // emerald-600
    UPI: '#2563EB',  // blue-600
    Card: '#7C3AED'  // violet-600
};

export default function Dashboard() {
    const { stats, loading, refresh } = useDashboard();

    if (loading) return <LoadingSpinner text="Preparing Dashboard..." />;
    if (!stats) return <div className="p-8">Failed to load data</div>;

    const cards = [
        { label: "Today's Revenue", value: `₹${stats.totalRevenue}`, icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+12.5%" },
        { label: "Total Bills", value: stats.totalBills, icon: Receipt, color: "text-blue-600", bg: "bg-blue-50", trend: "+4.3%" },
        { label: "Avg Bill Value", value: `₹${stats.avgBillValue}`, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50", trend: "+2.1%" },
        { label: "Low Stock Items", value: stats.lowStockCount, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50", warning: true },
    ];

    const paymentData = Object.entries(stats.paymentSplit)
        .filter(([_, value]) => value > 0) // Only show non-zero
        .map(([name, value]) => ({ name, value }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-stone-100 text-sm">
                    <p className="font-medium text-stone-900 mb-1">{label}</p>
                    <p className="text-emerald-600 font-semibold">
                        ₹{payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header and KPI Cards unchanged, skipping for brevity in replacement... wait I must replace full block if I want to be safe or use precise matching. I will use precise matching for the Payment Chart section. */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">Dashboard</h1>
                    <p className="text-stone-500 mt-1 font-medium text-sm">Overview & Analytics</p>
                </div>
                <button
                    onClick={refresh}
                    className="p-2.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all duration-300 hover:rotate-180"
                >
                    <RefreshCcw className="w-5 h-5" />
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-stone-100/50 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards hover:shadow-lg transition-all duration-300 group"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex justify-between items-start">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110", card.bg)}>
                                <card.icon className={cn("w-6 h-6", card.color)} />
                            </div>
                            {card.trend && (
                                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                    <ArrowUpRight className="w-3 h-3" />
                                    {card.trend}
                                </div>
                            )}
                            {card.warning && (
                                <div className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full animate-pulse">
                                    Action Needed
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-3xl font-semibold text-stone-800 tracking-tight mt-1 group-hover:text-emerald-600 transition-colors">{card.value}</h3>
                            <p className="text-stone-400 text-sm font-medium mt-1">{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-stone-100 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-forwards">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-semibold text-stone-800">Revenue Trends</h3>
                            <p className="text-sm text-stone-400">Hourly breakdown</p>
                        </div>
                        <select className="text-sm bg-stone-50 border-none rounded-lg px-3 py-1.5 text-stone-600 font-medium outline-none cursor-pointer hover:bg-stone-100 transition-colors">
                            <option>Today</option>
                            <option>Yesterday</option>
                        </select>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.revenueByHour}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                                <XAxis
                                    dataKey="hour"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#a8a29e' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#a8a29e' }}
                                    tickFormatter={(value) => `₹${value}`}
                                    dx={-10}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-forwards flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-stone-800">Payment Methods</h3>
                        <p className="text-sm text-stone-400">Transaction split</p>
                    </div>
                    <div className="flex-1 min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {paymentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[entry.name] || '#ccc'} className="focus:outline-none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`₹${value}`, 'Amount']}
                                    itemStyle={{ color: '#10b981' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text for Donut */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <span className="block text-2xl font-bold text-stone-800">{stats.totalBills}</span>
                                <span className="text-xs text-stone-400 uppercase tracking-wider font-medium">Bills</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-8 flex-wrap">
                        {paymentData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[entry.name] || '#ccc' }} />
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Items Table */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700 fill-mode-forwards">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-stone-800">Top Selling Categories</h3>
                        <p className="text-sm text-stone-400">Performance by category</p>
                    </div>
                    <button className="text-sm text-emerald-600 font-medium hover:text-emerald-700">View Full Report</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-stone-50/50">
                            <tr>
                                <th className="px-6 py-4 font-medium text-stone-400 text-xs uppercase tracking-wider">Category Name</th>
                                <th className="px-6 py-4 font-medium text-stone-400 text-xs uppercase tracking-wider text-right">Revenue Generated</th>
                                <th className="px-6 py-4 font-medium text-stone-400 text-xs uppercase tracking-wider text-right">Contribution</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {stats.categorySales.map((item, idx) => {
                                const percentage = ((item.value / stats.totalRevenue) * 100).toFixed(1);
                                return (
                                    <tr key={idx} className="hover:bg-stone-50/80 transition-colors group cursor-default">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 font-medium text-xs group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    {idx + 1}
                                                </div>
                                                <span className="font-medium text-stone-700 group-hover:text-stone-900">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-semibold text-stone-800">₹{item.value}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                {percentage}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
