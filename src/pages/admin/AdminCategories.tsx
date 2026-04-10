import { useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Trash2, X, Pencil, FolderTree, Package } from "lucide-react";
import { toast } from "sonner";
import { products as localProducts, categories as localCats } from "@/data/dynamicProducts";

interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

const STORAGE_KEY = "admin_categories";

const defaultCategories = (): Category[] =>
  localCats
    .filter(c => c !== "All")
    .map((name, i) => ({
      id: i + 1,
      name,
      description: `Browse our collection of ${name.toLowerCase()} products.`,
      createdAt: new Date().toISOString(),
    }));

const load = (): Category[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return defaultCategories();
};

const save = (data: Category[]) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>(load);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const productCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    localProducts.forEach(p => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return map;
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Category name is required"); return; }
    let updated: Category[];
    if (editing) {
      updated = categories.map(c =>
        c.id === editing.id ? { ...c, name: form.name, description: form.description } : c
      );
      toast.success("Category updated");
    } else {
      const newCat: Category = {
        id: Date.now(), name: form.name,
        description: form.description, createdAt: new Date().toISOString(),
      };
      updated = [...categories, newCat];
      toast.success("Category added");
    }
    save(updated);
    setCategories(updated);
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this category?")) return;
    const updated = categories.filter(c => c.id !== id);
    save(updated);
    setCategories(updated);
    toast.success("Category deleted");
  };

  const totalProducts = categories.reduce((s, c) => s + (productCountMap[c.name] || 0), 0);

  const inputCls = "w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:border-primary focus:outline-none transition-colors";

  return (
    <AdminLayout title="Categories">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{categories.length} categories total</p>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg gold-gradient text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Categories", value: categories.length, color: "text-foreground", icon: <FolderTree size={18} /> },
            { label: "Total Products", value: totalProducts, color: "text-primary", icon: <Package size={18} /> },
            {
              label: "Avg Products / Category",
              value: categories.length > 0 ? Math.round(totalProducts / categories.length) : 0,
              color: "text-green-500",
              icon: <Package size={18} />,
            },
          ].map(s => (
            <div key={s.label} className="glass-card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.length === 0 ? (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <FolderTree size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">No categories yet</p>
              <p className="text-sm mt-1">Click "Add Category" to create one</p>
            </div>
          ) : categories.map(cat => {
            const count = productCountMap[cat.name] || 0;
            return (
              <div key={cat.id} className="glass-card p-5 hover-lift group relative overflow-hidden">
                {/* Decorative accent */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/30 rounded-l-xl" />

                <div className="flex items-start justify-between mb-3 pl-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FolderTree size={14} className="text-primary" />
                      </div>
                      <h3 className="font-display font-semibold text-foreground truncate">{cat.name}</h3>
                    </div>
                    <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                      {cat.description || "No description"}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                    <button onClick={() => openEdit(cat)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50 pl-3">
                  <div className="flex items-center gap-1.5">
                    <Package size={12} className="text-primary" />
                    <span className="text-primary text-xs font-semibold">{count} products</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(cat.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-semibold">{editing ? "Edit Category" : "New Category"}</h3>
                <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-muted/50 rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Category Name *</label>
                  <input
                    placeholder="e.g. Footwear"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className={inputCls}
                    onKeyDown={e => e.key === "Enter" && handleSave()}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Description</label>
                  <textarea
                    placeholder="Short description..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className={`${inputCls} resize-none h-24`}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/50">
                <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2.5 rounded-lg gold-gradient text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                  {editing ? "Update" : "Add"} Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
