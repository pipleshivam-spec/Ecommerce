import { useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Shield, User, Search, Mail, Phone, Calendar, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAllOrders } from "@/hooks/useOrders";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "customer";
  is_active: boolean;
  created_at: string;
  order_count: number;
  total_spent: number;
}

const USERS_KEY = "maison_users";
const AUTH_KEY  = "maison_auth_users";

const buildUsers = (): UserData[] => {
  const map = new Map<string, UserData>();

  // 1. Always include admin
  map.set("admin_1", {
    id: "admin_1", name: "Admin", email: "admin@maison.com",
    phone: "+91 98765 43210", role: "admin", is_active: true,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    order_count: 0, total_spent: 0,
  });

  // 2. Load registered users from auth store
  try {
    const authUsers = JSON.parse(localStorage.getItem(AUTH_KEY) || "[]");
    authUsers.forEach((u: any) => {
      if (u.role === "admin") return; // skip admin duplicate
      map.set(u.id, {
        id: u.id, name: u.name, email: u.email,
        phone: u.phone || "—", role: u.role || "customer",
        is_active: u.is_active !== false,
        created_at: u.created_at || new Date().toISOString(),
        order_count: 0, total_spent: 0,
      });
    });
  } catch {}

  // 3. Merge order data
  getAllOrders().forEach(o => {
    if (!map.has(o.user_id)) {
      map.set(o.user_id, {
        id: o.user_id, name: o.user_name, email: o.user_email,
        phone: o.shipping_phone || "—", role: "customer",
        is_active: true, created_at: o.created_at,
        order_count: 0, total_spent: 0,
      });
    }
    const u = map.get(o.user_id)!;
    u.order_count += 1;
    u.total_spent += o.total_amount;
  });

  return Array.from(map.values());
};

const saveOverrides = (data: UserData[]) =>
  localStorage.setItem(USERS_KEY, JSON.stringify(data));

const loadOverrides = (): Record<string, Partial<UserData>> => {
  try {
    const saved: UserData[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const map: Record<string, Partial<UserData>> = {};
    saved.forEach(u => { map[u.id] = { is_active: u.is_active }; });
    return map;
  } catch { return {}; }
};

const AdminUsers = () => {
  const [overrides, setOverrides] = useState<Record<string, Partial<UserData>>>(loadOverrides);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Always rebuild fresh from sources, apply overrides on top
  const users: UserData[] = useMemo(() => {
    const base = buildUsers();
    return base.map(u => ({ ...u, ...(overrides[u.id] || {}) }));
  }, [overrides]);

  const filtered = useMemo(() =>
    users.filter(u => {
      const q = searchTerm.toLowerCase();
      return (
        (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
        (filterRole === "all" || u.role === filterRole)
      );
    }), [users, searchTerm, filterRole]);

  const stats = {
    total: users.length,
    customers: users.filter(u => u.role === "customer").length,
    admins: users.filter(u => u.role === "admin").length,
    active: users.filter(u => u.is_active).length,
  };

  const deleteUser = (id: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    const updated = users.filter(u => u.id !== id);
    try {
      const auth = JSON.parse(localStorage.getItem("maison_auth_users") || "[]");
      localStorage.setItem("maison_auth_users", JSON.stringify(auth.filter((u: any) => u.id !== id)));
    } catch {}
    saveOverrides(updated);
    setOverrides(prev => { const n = { ...prev }; delete n[id]; return n; });
    toast.success("User deleted");
  };

  const toggleStatus = (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    const newActive = !user.is_active;
    const newOverrides = { ...overrides, [id]: { is_active: newActive } };
    setOverrides(newOverrides);
    saveOverrides(users.map(u => u.id === id ? { ...u, is_active: newActive } : u));
    toast.success(`User ${newActive ? "activated" : "deactivated"}`);
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
                  {["User", "Contact", "Role", "Orders", "Spent", "Joined", "Status", "Actions"].map(h => (
                    <th key={h} className={`px-6 py-4 text-muted-foreground font-medium text-xs uppercase tracking-wider ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">No users found</td></tr>
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
                        {u.phone && u.phone !== "—" && (
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
                    <td className="px-6 py-4 text-center font-semibold">{u.order_count}</td>
                    <td className="px-6 py-4 font-semibold text-primary">
                      {u.total_spent > 0 ? `₹${u.total_spent.toFixed(0)}` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">{new Date(u.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleStatus(u.id)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                          title={u.is_active ? "Deactivate" : "Activate"}>
                          {u.is_active
                            ? <ToggleRight className="h-5 w-5 text-green-600" />
                            : <ToggleLeft className="h-5 w-5 text-red-600" />}
                        </button>
                        {u.role !== "admin" && (
                          <button onClick={() => deleteUser(u.id)}
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
