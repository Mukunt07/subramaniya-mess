import { useDashboard } from "./useDashboard";
import {
    BarChart,
    Bar,
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
    RefreshCcw
} from "lucide-react";
import { cn } from "../../lib/utils";

const COLORS = ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'];

export default function Dashboard() {
    const { stats, loading, refresh } = useDashboard();

    if (loading) return <div className="p-8">Loading dashboard...</div>;
    if (!stats) return <div className="p-8">Failed to load data</div>;

    const cards = [
        { label: "Today's Revenue", value: `₹${stats.totalRevenue}`, icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Total Bills", value: stats.totalBills, icon: Receipt, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Avg Bill Value", value: `₹${stats.avgBillValue}`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Low Stock Items", value: stats.lowStockCount, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
    ];

    const paymentData = Object.entries(stats.paymentSplit).map(([name, value]) => ({ name, value }));

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Overview for today</p>
                </div>
                <button
                    onClick={refresh}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                >
                    <RefreshCcw className="w-5 h-5" />
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <div key={card.label} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className={cn("p-3 rounded-xl", card.bg)}>
                            <card.icon className={cn("w-6 h-6", card.color)} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{card.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Hourly Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue by Hour</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.revenueByHour.filter(d => d.amount > 0 || true)}> {/* Show all hours? Maybe simplistic */}
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip
                                    cursor={{ fill: '#ecfdf5' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payment Split */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Payment Mode Split</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {paymentData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-4">
                            {paymentData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Items Table (Category Sales replacement since we don't have cat in bill) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Top Selling Items</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Item Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-sm text-right">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {stats.categorySales.map((item, idx) => (
                            <tr key={idx}>
                                <td className="px-6 py-4 text-gray-900 font-medium">{item.name}</td>
                                <td className="px-6 py-4 text-gray-900 text-right">₹{item.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
