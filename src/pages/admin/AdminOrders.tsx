import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, Package, Calendar, TrendingUp, ShoppingBag, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { getAllOrders, updateOrderStatus, Order } from "@/hooks/useOrders";
import { sendOrderStatusEmail } from "@/services/emailService";

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'year';

const filterByDate = (orders: Order[], filter: DateFilter): Order[] => {
  if (filter === 'all') return orders;
  const now = new Date();
  const cutoff = new Date();
  if (filter === 'today') { cutoff.setHours(0, 0, 0, 0); }
  if (filter === 'week')  cutoff.setDate(now.getDate() - 7);
  if (filter === 'month') cutoff.setMonth(now.getMonth() - 1);
  if (filter === 'year')  cutoff.setFullYear(now.getFullYear() - 1);
  return orders.filter(o => new Date(o.created_at) >= cutoff);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':  return 'bg-blue-100 text-blue-700';
    case 'processing': return 'bg-indigo-100 text-indigo-700';
    case 'shipped':    return 'bg-purple-100 text-purple-700';
    case 'delivered':  return 'bg-green-100 text-green-700';
    case 'cancelled':  return 'bg-red-100 text-red-700';
    default:           return 'bg-gray-100 text-gray-700';
  }
};

const AdminOrders = () => {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFilter, setDateFilter]   = useState<DateFilter>('all');

  const loadOrders = () => setOrders(getAllOrders());
  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
    loadOrders();
    toast.success('Order status updated');
    const order = orders.find(o => o.id === orderId);
    if (order) sendOrderStatusEmail({ ...order, status: newStatus });
  };

  const dateFiltered = useMemo(() => filterByDate(orders, dateFilter), [orders, dateFilter]);

  const filtered = useMemo(() => dateFiltered.filter(o => {
    const matchSearch = o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  }), [dateFiltered, searchTerm, filterStatus]);

  const stats = useMemo(() => ({
    total:      dateFiltered.length,
    confirmed:  dateFiltered.filter(o => o.status === 'confirmed').length,
    processing: dateFiltered.filter(o => o.status === 'processing').length,
    shipped:    dateFiltered.filter(o => o.status === 'shipped').length,
    delivered:  dateFiltered.filter(o => o.status === 'delivered').length,
    cancelled:  dateFiltered.filter(o => o.status === 'cancelled').length,
    revenue:    dateFiltered.reduce((s, o) => s + o.total_amount, 0),
  }), [dateFiltered]);

  const dateFilterLabel: Record<DateFilter, string> = {
    all: 'All Time', today: 'Today', week: 'This Week', month: 'This Month', year: 'This Year'
  };

  return (
    <AdminLayout title="Orders">
      <div className="space-y-6">

        {/* ── Date Filter Tabs ── */}
        <div className="glass-card p-1.5 inline-flex gap-1 rounded-xl">
          {(['today', 'week', 'month', 'year', 'all'] as DateFilter[]).map(f => (
            <button key={f} onClick={() => setDateFilter(f)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                dateFilter === f
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}>
              <Calendar size={14} />
              {dateFilterLabel[f]}
            </button>
          ))}
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ShoppingBag size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{dateFilterLabel[dateFilter]}</p>
            </div>
          </div>

          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <IndianRupee size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{stats.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{dateFilterLabel[dateFilter]}</p>
            </div>
          </div>

          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Delivered</p>
              <p className="text-2xl font-bold text-purple-600">{stats.delivered}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0}% success rate
              </p>
            </div>
          </div>

          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Package size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.confirmed + stats.processing + stats.shipped}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Active orders</p>
            </div>
          </div>
        </div>

        {/* ── Search & Status Filter ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search by order, name, email..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary">
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <p className="self-center text-sm text-muted-foreground whitespace-nowrap">
            {filtered.length} order{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* ── Orders Table ── */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">Order #</th>
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">Customer</th>
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">Items</th>
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">Payment</th>
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                      <Package size={48} className="mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No orders found</p>
                      <p className="text-xs mt-1">Try changing the date filter or search term</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(order => (
                    <tr key={order.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{order.order_number}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{order.user_name}</p>
                        <p className="text-xs text-muted-foreground">{order.user_email}</p>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-primary">₹{order.total_amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Paid ✓</span>
                      </td>
                      <td className="px-6 py-4">
                        <select value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value as Order['status'])}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 focus:outline-none cursor-pointer ${getStatusColor(order.status)}`}>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
