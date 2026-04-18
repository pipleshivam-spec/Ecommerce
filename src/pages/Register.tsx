import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { setWelcomeOffer } from "@/lib/offersStore";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.password.trim()) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const saveUserLocally = (user: { id: string; name: string; email: string; password: string; phone?: string; role: string; created_at: string; is_active: boolean }) => {
      const existing: typeof user[] = JSON.parse(localStorage.getItem("maison_users") || "[]");
      const deduped = existing.filter(u => u.email !== user.email);
      localStorage.setItem("maison_users", JSON.stringify([...deduped, user]));
    };

    const existing: { email: string }[] = JSON.parse(localStorage.getItem("maison_users") || "[]");
    if (existing.some(u => u.email === form.email.toLowerCase().trim())) {
      toast.error("Email already registered.");
      setLoading(false);
      return;
    }

    const newUser = {
      id: `local_${Date.now()}`,
      name: form.name.trim(),
      email: form.email.toLowerCase().trim(),
      password: form.password,
      phone: form.phone.trim(),
      role: "customer" as const,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    saveUserLocally(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("token", `local_token_${newUser.id}`);
    try {
      setWelcomeOffer(newUser.id);
      localStorage.setItem("pending_welcome_uid", newUser.id);
    } catch {}
    toast.success("Account created! Please login.");
    setLoading(false);
    navigate("/login");
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
            <h1 className="font-display text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground text-sm">Join the MAISON community</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input type="text" placeholder="Full Name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass("name")} />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <input type="email" placeholder="Email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass("email")} />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <input type="tel" placeholder="Phone" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass("phone")} />
              {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <input type="password" placeholder="Password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} className={inputClass("password")} />
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              <UserPlus size={16} /> {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Register;
