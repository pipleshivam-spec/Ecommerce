import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatCard from "@/components/admin/StatCard";
import { Package, FolderTree, Users, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { getAllOrders, Order } from "@/hooks/useOrders";
import { products as localProducts } from "@/data/dynamicProducts";
import { categories as localCats } from "@/data/dynamicProducts";

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getAllOrders());
  }, []);

  const totalRevenue = useMemo(() => orders.reduce((s, o) => s + o.total_amount, 0), [orders]);
  const recentOrders = orders.slice(0, 5);

  // Count users from localStorage orders (unique user_ids)
  const totalUsers = useMemo(() => {
    const ids = new Set(orders.map(o => o.user_id));
    return Math.max(ids.size, 1); // at least 1 (admin)
  }, [orders]);

  const totalProducts = localProducts.length;
  const totalCategories = localCats.filter(c => c !== "All").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-500/10 text-green-500";
      case "shipped":   return "bg-blue-500/10 text-blue-500";
      case "cancelled": return "bg-red-500/10 text-red-500";
      case "confirmed": return "bg-blue-500/10 text-blue-500";
      default:          return "bg-yellow-500/10 text-yellow-500";
    }
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard title="Total Products"  value={totalProducts}   icon={Package}     />
          <StatCard title="Categories"      value={totalCategories} icon={FolderTree}  />
          <StatCard title="Total Users"     value={totalUsers}      icon={Users}       />
          <StatCard title="Total Orders"    value={orders.length}   icon={ShoppingCart}/>
        </div>

        {/* Revenue + Recent Orders */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Revenue Overview */}
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Revenue Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <span className="text-2xl font-bold text-primary">₹{totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Orders</span>
                <span className="text-lg font-semibold">{orders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Delivered</span>
                <span className="text-lg font-semibold text-green-600">
                  {orders.filter(o => o.status === "delivered").length}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500 font-medium">
                  Avg: ₹{orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : "0.00"} per order
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-500 font-medium">
                  {orders.filter(o => o.status === "confirmed" || o.status === "processing").length} active orders
                </span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="glass-card p-6 xl:col-span-2">
            <h3 className="font-display text-lg font-semibold mb-4">Recent Orders</h3>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                <p>No orders yet — place an order to see data here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      {["Order #", "Customer", "Amount", "Status", "Date"].map(h => (
                        <th key={h} className="text-left py-3 text-muted-foreground font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 font-medium">{order.order_number}</td>
                        <td className="py-3 text-muted-foreground">{order.user_name}</td>
                        <td className="py-3 font-medium">₹{order.total_amount.toFixed(2)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
