import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook } from "lucide-react";

const Footer = () => (
  <footer className="bg-card border-t border-border/50">
    <div className="container-main py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <h3 className="font-display text-xl font-bold mb-4">
            <span className="gold-text">MAISON</span>
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Redefining fashion with timeless elegance and modern craftsmanship since 2010.
          </p>
          <div className="flex gap-3">
            {[Instagram, Twitter, Facebook].map((Icon, i) => (
              <a key={i} href="#" className="p-2.5 rounded-full border border-border hover:border-primary/50 hover:text-primary text-muted-foreground transition-all">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider mb-4 text-foreground">Quick Links</h4>
          <ul className="space-y-2">
            {[{ l: "Home", p: "/" }, { l: "Shop", p: "/products" }, { l: "Categories", p: "/categories" }, { l: "About", p: "/about" }, { l: "Contact", p: "/contact" }].map(
              (item) => (
                <li key={item.l}>
                  <Link to={item.p} className="text-sm text-muted-foreground hover:text-primary transition-colors">{item.l}</Link>
                </li>
              )
            )}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider mb-4 text-foreground">Categories</h4>
          <ul className="space-y-2">
            {["Men", "Women", "Shoes", "Accessories", "Bags"].map((c) => (
              <li key={c}>
                <Link to={`/products?category=${c}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{c}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider mb-4 text-foreground">Contact</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-muted-foreground"><Mail size={14} className="text-primary" /> info@maison.com</li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground"><Phone size={14} className="text-primary" /> +1 (555) 123-4567</li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin size={14} className="text-primary" /> 123 Fashion Ave, NYC</li>
          </ul>
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-2 text-foreground">Newsletter</h4>
            <form onSubmit={(e) => e.preventDefault()} className="flex">
              <input type="email" placeholder="Your email" className="flex-1 px-3 py-2 bg-background border border-border rounded-l-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
              <button className="px-4 py-2 gold-gradient text-primary-foreground text-xs font-semibold rounded-r-md">Join</button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
        © 2026 MAISON. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
