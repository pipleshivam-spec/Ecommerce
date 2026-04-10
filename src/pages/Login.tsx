import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { setWelcomeOffer } from "@/lib/offersStore";

const USERS_KEY = "maison_auth_users";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "admin" | "customer";
  is_active: boolean;
  created_at: string;
}

const getUsers = (): StoredUser[] => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
};

// Seed default admin always
const ensureAdmin = () => {
  const users = getUsers();
  if (!users.find(u => u.email === "admin@maison.com")) {
    users.unshift({
      id: "admin_1",
      name: "Admin",
      email: "admin@maison.com",
      password: "admin123",
      phone: "+91 98765 43210",
      role: "admin",
      is_active: true,
      created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};
ensureAdmin();

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password.trim()) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    await new Promise(r => setTimeout(r, 500));

    const users = getUsers();
    const user = users.find(
      u => u.email.toLowerCase() === form.email.toLowerCase().trim() &&
           u.password === form.password
    );

    if (!user) {
      toast.error("Invalid email or password");
      setLoading(false);
      return;
    }

    if (!user.is_active) {
      toast.error("Your account has been deactivated");
      setLoading(false);
      return;
    }

    // Save session
    const token = `token_${user.id}_${Date.now()}`;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at,
    }));

    // Activate welcome offer — match pending UID set during registration
    const pendingUid = localStorage.getItem("pending_welcome_uid");
    if (pendingUid && pendingUid === user.id) {
      setWelcomeOffer(user.id);
      localStorage.removeItem("pending_welcome_uid");
    }

    toast.success(`Welcome back, ${user.name}!`);
    setLoading(false);

    // Dispatch storage event so ProductCard picks up user + welcome offer immediately
    window.dispatchEvent(new StorageEvent("storage", { key: "user" }));
    window.dispatchEvent(new StorageEvent("storage", { key: "maison_welcome_offer" }));

    if (user.role === "admin") navigate("/admin");
    else navigate("/");
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 bg-background border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors text-sm ${
      errors[field] ? "border-destructive" : "border-border focus:border-primary/50"
    }`;

  return (
    <Layout>
      <section className="min-h-screen flex items-center justify-center pt-20 pb-16">
        <div className="glass-card p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground text-sm">Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input type="email" placeholder="Email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass("email")} />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <input type="password" placeholder="Password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} className={inputClass("password")} />
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              <LogIn size={16} /> {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Login;
