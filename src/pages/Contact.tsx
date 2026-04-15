import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email format";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!/^\+?[\d\s-]{7,15}$/.test(form.phone)) e.phone = "Invalid phone number";
    if (!form.message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", message: "" });
      setErrors({});
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 bg-card border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors text-sm ${
      errors[field] ? "border-destructive" : "border-border focus:border-primary/50"
    }`;

  return (
    <Layout>
      <section className="pt-28 pb-8">
        <div className="container-main text-center">
          <p className="text-primary text-sm font-medium tracking-[0.3em] uppercase mb-3">Get in Touch</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">Contact Us</h1>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-main grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">We'd Love to Hear From You</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Whether you have a question about our products, need styling advice, or want to place a custom order — our team is ready to help.
            </p>
            <div className="space-y-6">
              {[
                { icon: Mail, label: "Email", value: "maisonwebsite04@gmail.com" },
                { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
                { icon: MapPin, label: "Address", value: "Vadodara, India" },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-4">
                  <div className="p-3 rounded-sm bg-primary/10">
                    <c.icon className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{c.label}</p>
                    <p className="text-muted-foreground text-sm">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
            <div>
              <input
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass("name")}
              />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass("email")}
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <input
                type="tel"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass("phone")}
              />
              {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <textarea
                placeholder="Your Message"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={inputClass("message")}
              />
              {errors.message && <p className="text-destructive text-xs mt-1">{errors.message}</p>}
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <Send size={16} /> Send Message
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
