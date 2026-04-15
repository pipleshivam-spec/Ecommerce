import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, Heart, User, Search, Sun, Moon } from "lucide-react";
import ThemeSelector from "@/components/ThemeSelector";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/products" },
  { label: "Categories", path: "/categories" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const { totalItems: cartCount } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location]);

  useEffect(() => setMobileOpen(false), [location]);

  const IconBtn = ({ children, count, to }: { children: React.ReactNode; count?: number; to?: string }) => {
    const content = (
      <span className="relative p-2 rounded-full hover:bg-muted/50 transition-colors cursor-pointer">
        {children}
        {count && count > 0 ? (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gold-gradient text-[10px] font-bold flex items-center justify-center text-primary-foreground">
            {count}
          </span>
        ) : null}
      </span>
    );
    return to ? <Link to={to}>{content}</Link> : content;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border/50 py-3 shadow-lg shadow-background/20"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container-main flex items-center justify-between">
        <Link to="/" className="font-display text-2xl font-bold tracking-wider">
          <span className="gold-text">MAISON</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className={`text-sm font-medium tracking-wide uppercase transition-colors duration-200 hover:text-primary relative group ${
                location.pathname === link.path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-1">
          <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-full hover:bg-muted/50 transition-colors">
            <Search size={18} className="text-muted-foreground hover:text-foreground transition-colors" />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted/50 transition-colors">
            {theme === "dark" ? <Sun size={18} className="text-muted-foreground hover:text-primary transition-colors" /> : <Moon size={18} className="text-muted-foreground hover:text-primary transition-colors" />}
          </button>
          <ThemeSelector />
          <IconBtn to="/wishlist" count={wishlistCount}>
            <Heart size={18} className="text-muted-foreground" />
          </IconBtn>
          <IconBtn to="/cart" count={cartCount}>
            <ShoppingBag size={18} className="text-muted-foreground" />
          </IconBtn>
          <Link
            to={isLoggedIn ? "/profile" : "/login"}
            className="ml-2 p-2 rounded-full hover:bg-muted/50 transition-colors"
            title={isLoggedIn ? "Profile" : "Login"}
          >
            <User size={18} className="text-muted-foreground hover:text-foreground transition-colors" />
          </Link>
        </div>

        {/* Mobile Right */}
        <div className="flex lg:hidden items-center gap-1">
          <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-full hover:bg-muted/50 transition-colors">
            <Search size={20} className="text-foreground" />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted/50 transition-colors">
            {theme === "dark" ? <Sun size={20} className="text-foreground" /> : <Moon size={20} className="text-foreground" />}
          </button>
          <ThemeSelector />
          <IconBtn to="/wishlist" count={wishlistCount}>
            <Heart size={20} className="text-foreground" />
          </IconBtn>
          <IconBtn to="/cart" count={cartCount}>
            <ShoppingBag size={20} className="text-foreground" />
          </IconBtn>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-full hover:bg-muted/50 transition-colors" aria-label="Toggle menu">
            {mobileOpen ? <X size={22} className="text-foreground" /> : <Menu size={22} className="text-foreground" />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-background/95 backdrop-blur-xl border-b border-border/50"
          >
            <div className="container-main py-4">
              <input
                type="text"
                placeholder="Search products..."
                autoFocus
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-lg focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchOpen(false);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/98 backdrop-blur-xl border-t border-border/50 overflow-hidden"
          >
            <nav className="container-main py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`text-base font-medium tracking-wide uppercase py-2 transition-colors ${
                    location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-4 border-t border-border/50">
                <Link to="/wishlist" className="flex-1 text-center py-2 border border-border rounded-sm text-sm font-medium text-foreground">
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
                <Link to={isLoggedIn ? "/profile" : "/login"} className="flex-1 text-center py-2 rounded-sm gold-gradient text-primary-foreground text-sm font-medium">
                  {isLoggedIn ? "Profile" : "Login"}
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
