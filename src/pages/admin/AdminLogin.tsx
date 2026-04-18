import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { toast } from "sonner";

const AdminLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.password.trim()) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      const user = data.data.user;

      if (user.role !== "admin") {
        toast.error("Access denied. Admin only.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Welcome, Admin!");
      navigate("/admin");
    } catch {
      toast.error("Cannot connect to server. Make sure backend is running.");
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 bg-background border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors text-sm ${
      errors[field] ? "border-destructive" : "border-border focus:border-primary/50"
    }`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">Sign in to manage your store</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input type="email" placeholder="Admin Email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass("email")} />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <input type="password" placeholder="Password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} className={inputClass("password")} />
            {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
          </div>
          <button type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
            <Shield className="h-4 w-4" /> {loading ? "Signing in..." : "Sign In as Admin"}
          </button>
        </form>
        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          Default: admin@ecommerce.com / Admin@123
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
