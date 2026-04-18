import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Shield, User, Search, Mail, Phone, Calendar, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "customer";
  is_active: boolean;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(() => {
    const authUsers: UserData[] = JSON.parse(localStorage.getItem('maison_users') || '[]');
    const orders = JSON.parse(localStorage.getItem('ecom_orders') || '[]');

    // Always include admin
    const adminExists = authUsers.find(u => u.email === 'admin@maison.com');
    if (!adminExists) {
      authUsers.unshift({
        id: 'admin_1', name: 'Admin', email: 'admin@maison.com',
        phone: '+91 98765 43210', role: 'admin', is_active: true,
        created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
      });
    }

    // Add order counts
    const usersWithStats = authUsers.map(u => {
      const userOrders = orders.filter((o: any) => o.user_id === u.id || o.user_email === u.email);
      return { ...u, order_count: userOrders.length, total_spent: userOrders.reduce((s: number, o: any) => s + o.total_amount, 0) };
    });

    setUsers(usersWithStats);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(u => {
    const q = searchTerm.toLowerCase();
    return (
      (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (filterRole === "all" || u.role === filterRole)
    );
  });

  const stats = {
    total: users.length,
    customers: users.filter(u => u.role === "customer").length,
    admins: users.filter(u => u.role === "admin").length,
    active: users.filter(u => u.is_active !== false).length,
  };

  const toggleStatus = (id: string, current: boolean) => {
    const authUsers = JSON.parse(localStorage.getItem('maison_users') || '[]');
    const updated = authUsers.map((u: any) => u.id === id ? { ...u, is_active: !current } : u);
    localStorage.setItem('maison_users', JSON.stringify(updated));
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !current } : u));
    toast.success(`User ${!current ? 'activated' : 'deactivated'}`);
  };

  const deleteUser = (id: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    const authUsers = JSON.parse(localStorage.getItem('maison_users') || '[]');
    localStorage.setItem('maison_users', JSON.stringify(authUsers.filter((u: any) => u.id !== id)));
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success('User deleted');
  };

  return (
    <AdminLayout title="Users">
      <div className="space-y-6">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text" placeholder="Search users..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary">
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4"><p className="text-sm text-muted-foreground">Total Users</p><p className="text-2xl font-bold mt-1">{stats.total}</p></div>
          <div className="glass-card p-4"><p className="text-sm text-muted-foreground">Customers</p><p className="text-2xl font-bold mt-1 text-blue-600">{stats.customers}</p></div>
          <div className="glass-card p-4"><p className="text-sm text-muted-foreground">Admins</p><p className="text-2xl font-bold mt-1 text-purple-600">{stats.admins}</p></div>
          <div className="glass-card p-4"><p className="text-sm text-muted-foreground">Active Users</p><p className="text-2xl font-bold mt-1 text-green-600">{stats.active}</p></div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  {["User", "Contact", "Role", "Joined", "Status", "Actions"].map(h => (
                    <th key={h} className={`px-6 py-4 text-muted-foreground font-medium text-xs uppercase tracking-wider ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Loading users...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No users found</td></tr>
                ) : filtered.map(u => (
                  <tr key={u.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                          u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-primary/10 text-primary"
                        }`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground leading-tight">{u.name}</p>
                          <p className="text-[10px] text-muted-foreground">ID: {String(u.id).slice(0, 12)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="text-xs truncate max-w-[150px]">{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span className="text-xs">{u.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {u.role === "admin" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">{new Date(u.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        u.is_active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {u.is_active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleStatus(String(u.id), u.is_active !== false)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                          title={u.is_active !== false ? "Deactivate" : "Activate"}>
                          {u.is_active !== false
                            ? <ToggleRight className="h-5 w-5 text-green-600" />
                            : <ToggleLeft className="h-5 w-5 text-red-600" />}
                        </button>
                        {u.role !== "admin" && (
                          <button onClick={() => deleteUser(String(u.id))}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                            title="Delete user">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
