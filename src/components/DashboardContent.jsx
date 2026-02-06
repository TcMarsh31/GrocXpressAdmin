"use client";

import React from "react";
import {
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Package,
  Clock,
  CheckCircle,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import ClientDate from "@/components/ClientDate";

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
  <div
    className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md`}
  >
    <div className="absolute -right-8 -top-8 opacity-10">
      <Icon size={120} />
    </div>
    <div className="relative space-y-2">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <div className="pt-2">
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        {trend && (
          <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
            <TrendingUp size={14} />
            <span>{trend}% from last month</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
    completed: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: CheckCircle,
    },
    cancelled: { bg: "bg-red-100", text: "text-red-700", icon: AlertTriangle },
    processing: { bg: "bg-blue-100", text: "text-blue-700", icon: Zap },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}
    >
      <StatusIcon size={12} />
      <span className="capitalize">{status}</span>
    </div>
  );
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const RevenueChart = ({ data }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <TrendingUp size={20} className="text-green-600" />
        Revenue Trend
      </h3>
      <p className="mt-1 text-sm text-slate-600">Last 7 days performance</p>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data || []}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #475569",
            borderRadius: "8px",
            color: "#f1f5f9",
          }}
          formatter={(value) => `$${value.toFixed(2)}`}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#10b981"
          strokeWidth={3}
          dot={{ fill: "#10b981", r: 5 }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const OrderStatusChart = ({ data }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <ShoppingCart size={20} className="text-blue-600" />
        Order Status Distribution
      </h3>
      <p className="mt-1 text-sm text-slate-600">All time orders by status</p>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data || []}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {(data || []).map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => `${value} orders`}
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #475569",
            borderRadius: "8px",
            color: "#f1f5f9",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default function DashboardContent({ stats }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Welcome back! Here's your business overview.
        </p>
      </div>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={stats.ordersCount.toLocaleString()}
          trend={12}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={`$${(stats.revenue || 0).toFixed(0)}`}
          trend={8}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={(stats.lowStock || []).length}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={stats.revenueTrend} />
        <OrderStatusChart data={stats.statusDistribution} />
      </section>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - Takes 2 columns */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Orders
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(stats.recent || []).length > 0 ? (
                  stats.recent.map((o) => (
                    <tr
                      key={o.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">
                          #{o.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <ClientDate iso={o.created_at} />
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        ${(o.total_price || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Low Stock Alert
              </h2>
            </div>
          </div>
          <div className="space-y-3 p-6">
            {(stats.lowStock || []).length > 0 ? (
              stats.lowStock.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-orange-600" />
                    <span className="text-sm font-medium text-slate-900">
                      Product {p.id}
                    </span>
                  </div>
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
                    {p.stock}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle size={32} className="mb-2 text-green-600" />
                <p className="text-sm text-slate-600">
                  All products are well-stocked!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Zap size={20} className="mt-0.5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Real-time Analytics
            </p>
            <p className="mt-1 text-sm text-blue-700">
              Charts update automatically based on your latest orders and
              revenue data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
