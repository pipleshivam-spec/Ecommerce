import { useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Pencil, Trash2, X, Search, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { products as localProducts, categories as localCats } from "@/data/dynamicProducts";

interface AdminProduct {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  image: string;
  stock: number;
  sku: string;
  is_active: boolean;
  badge?: string;
  rating: number;
  reviews: number;
}

const toAdmin = (p: typeof localProducts[0]): AdminProduct => ({
  id: p.id,
  name: p.name,
  price: p.price,
  originalPrice: p.originalPrice,
  category: p.category,
  description: p.description,
  image: p.image,
  stock: Math.floor(Math.random() * 90) + 10,
  sku: `SKU-${String(p.id).padStart(4, "0")}`,
  is_active: true,
  badge: p.badge,
  rating: p.rating,
  reviews: p.reviews,
});

const STORAGE_KEY = "admin_products";

const load = (): AdminProduct[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: AdminProduct[] = JSON.parse(saved);
      // Sync prices from source if they differ
      const synced = parsed.map(p => {
        const source = localProducts.find(s => s.id === p.id);
        return source ? { ...p, price: source.price, originalPrice: source.originalPrice } : p;
      });
      return synced;
    }
  } catch {}
  return localProducts.map(toAdmin);
};

const save = (data: AdminProduct[]) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const emptyForm = {
  name: "", price: "", originalPrice: "", category: "",
  description: "", image: "", stock: "", sku: "", is_active: true, badge: "",
};

const AdminProducts = () => {
  const [products, setProducts] = useState<AdminProduct[]>(load);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [form, setForm] = useState(emptyForm);

  const cats = useMemo(() => ["all", ...Array.from(new Set(localCats.filter(c => c !== "All")))], []);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (
      (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) &&
      (filterCat === "all" || p.category === filterCat)
    );
  });

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, sku: `SKU-${Date.now()}` });
    setShowForm(true);
  };

  const openEdit = (p: AdminProduct) => {
    setEditing(p);
    setForm({
      name: p.name, price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      category: p.category, description: p.description,
      image: p.image, stock: String(p.stock),
      sku: p.sku, is_active: p.is_active, badge: p.badge || "",
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.price || !form.category) {
      toast.error("Name, price and category are required");
      return;
    }
    let updated: AdminProduct[];
    if (editing) {
      updated = products.map(p =>
        p.id === editing.id
          ? {
              ...p, name: form.name, price: Number(form.price),
              originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
              category: form.category, description: form.description,
              image: form.image || p.image, stock: Number(form.stock) || 0,
              sku: form.sku, is_active: form.is_active,
              badge: form.badge || undefined,
            }
          : p
      );
      toast.success("Product updated");
    } else {
      const newP: AdminProduct = {
        id: Date.now(), name: form.name, price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        category: form.category, description: form.description,
        image: form.image || "/placeholder.jpg", stock: Number(form.stock) || 0,
        sku: form.sku, is_active: form.is_active,
        badge: form.badge || undefined, rating: 4.5, reviews: 0,
      };
      updated = [...products, newP];
      toast.success("Product added");
    }
    save(updated);
    setProducts(updated);
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this product?")) return;
    const updated = products.filter(p => p.id !== id);
    save(updated);
    setProducts(updated);
    toast.success("Product deleted");
  };

  const toggleStatus = (id: number) => {
    const updated = products.map(p =>
      p.id === id ? { ...p, is_active: !p.is_active } : p
    );
    save(updated);
    setProducts(updated);
    const p = updated.find(x => x.id === id);
    toast.success(`Product ${p?.is_active ? "activated" : "deactivated"}`);
  };

  const inputCls = "w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:border-primary focus:outline-none transition-colors";

  return (
    <AdminLayout title="Products">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
            >
              {cats.map(c => (
                <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
              ))}
            </select>
          </div>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg gold-gradient text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: products.length, color: "text-foreground" },
            { label: "Active", value: products.filter(p => p.is_active).length, color: "text-green-500" },
            { label: "Inactive", value: products.filter(p => !p.is_active).length, color: "text-red-500" },
            { label: "Low Stock", value: products.filter(p => p.stock < 10).length, color: "text-yellow-500" },
          ].map(s => (
            <div key={s.label} className="glass-card p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  {["Product", "SKU", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                    <th key={h} className={`px-5 py-3.5 text-muted-foreground font-medium text-xs uppercase tracking-wider ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">No products found</td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border/50" />
                        <div>
                          <p className="font-medium text-foreground leading-tight">{p.name}</p>
                          {p.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">{p.badge}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-mono text-xs">{p.sku}</td>
                    <td className="px-5 py-4 text-muted-foreground">{p.category}</td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-primary">₹{p.price}</span>
                      {p.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through ml-1">₹{p.originalPrice}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={p.stock < 10 ? "text-red-500 font-semibold" : "text-foreground"}>{p.stock}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleStatus(p.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          p.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {p.is_active ? <Eye size={11} /> : <EyeOff size={11} />}
                        {p.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 ml-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-semibold">{editing ? "Edit Product" : "New Product"}</h3>
                <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-muted/50 rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Product Name *</label>
                    <input placeholder="e.g. Classic T-Shirt" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Category *</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls}>
                      <option value="">Select category</option>
                      {localCats.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Price (₹) *</label>
                    <input type="number" placeholder="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Original Price (₹)</label>
                    <input type="number" placeholder="0" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Stock</label>
                    <input type="number" placeholder="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">SKU</label>
                    <input placeholder="SKU-0001" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Badge</label>
                    <select value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} className={inputCls}>
                      <option value="">None</option>
                      {["New", "Sale", "Best Seller", "Hot"].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Status</label>
                    <select value={form.is_active ? "active" : "inactive"} onChange={e => setForm({ ...form, is_active: e.target.value === "active" })} className={inputCls}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Image URL</label>
                  <input placeholder="https://..." value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Description</label>
                  <textarea placeholder="Product description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none h-24`} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/50">
                <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2.5 rounded-lg gold-gradient text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                  {editing ? "Update" : "Add"} Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
