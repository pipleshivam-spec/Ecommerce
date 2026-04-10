import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { getProductById, products } from "@/data/dynamicProducts";
import { ShoppingCart, Heart, ArrowLeft, Check, Minus, Plus, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import FlashSaleTimer from "@/components/FlashSaleTimer";
import { getActiveFlashSale, FlashSale, hasWelcomeOffer, WELCOME_DISCOUNT, getActiveCoupon, CouponOffer } from "@/lib/offersStore";

const tabs = ["Description", "Reviews", "Specifications"];

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(Number(id));
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Description");
  const [selectedImage, setSelectedImage] = useState(0);
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [welcomeActive, setWelcomeActive] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<CouponOffer | null>(null);

  useEffect(() => {
    setFlashSale(getActiveFlashSale());
    setActiveCoupon(getActiveCoupon());
    const checkWelcome = () => {
      try {
        const userRaw = localStorage.getItem("user");
        if (!userRaw) { setWelcomeActive(false); return; }
        const uid = String(JSON.parse(userRaw).id);
        setWelcomeActive(hasWelcomeOffer(uid));
      } catch { setWelcomeActive(false); }
    };
    checkWelcome();
    const handler = (e: StorageEvent) => {
      if (e.key === "flash_sales") setFlashSale(getActiveFlashSale());
      if (e.key === "store_offers") setActiveCoupon(getActiveCoupon());
      if (e.key === "maison_welcome_offer" || e.key === "maison_welcome_used" || e.key === "user") checkWelcome();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold mb-4">Product Not Found</h1>
            <Link to="/products" className="text-primary font-medium">← Back to Shop</Link>
          </div>
        </div>
      </Layout>
    );
  }

  const couponDiscountedPrice = !welcomeActive && activeCoupon
    ? activeCoupon.type === "percentage"
      ? Math.round(product.price * (1 - activeCoupon.discount / 100))
      : Math.max(0, product.price - activeCoupon.discount)
    : null;

  const wishlisted = isInWishlist(product.id);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <Layout>
      <section className="pt-28 pb-16">
        <div className="container-main">
          <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm">
            <ArrowLeft size={16} /> Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl overflow-hidden bg-card relative group mb-4">
                <img src={product.images[selectedImage]} alt={product.name} className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105" />
                {product.badge && (
                  <span className={`absolute top-4 left-4 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full ${
                    product.badge === "Sale" ? "bg-destructive text-destructive-foreground" : "gold-gradient text-primary-foreground"
                  }`}>{product.badge}</span>
                )}
                {flashSale && (
                  <div className="absolute top-4 right-4">
                    <FlashSaleTimer endsAt={flashSale.endsAt} compact discount={flashSale.discount} />
                  </div>
                )}
              </motion.div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? "border-primary" : "border-transparent hover:border-border"
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full aspect-square object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col justify-center">
              <p className="text-primary text-xs font-medium tracking-[0.4em] uppercase mb-3">{product.category}</p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">{product.name}</h1>

              <div className="flex items-center gap-2 mb-5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className={i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-muted-foreground/30"} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                {welcomeActive ? (
                  <>
                    <span className="text-3xl font-black text-primary">₹{Math.round(product.price * (1 - WELCOME_DISCOUNT / 100))}</span>
                    <span className="text-xl text-muted-foreground line-through">₹{product.price}</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">-{WELCOME_DISCOUNT}% WELCOME</span>
                  </>
                ) : couponDiscountedPrice ? (
                  <>
                    <span className="text-3xl font-black text-violet-600 dark:text-violet-400">₹{couponDiscountedPrice}</span>
                    <span className="text-xl text-muted-foreground line-through">₹{product.price}</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700">
                      -{activeCoupon!.type === "percentage" ? `${activeCoupon!.discount}%` : `₹${activeCoupon!.discount}`} OFF
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-primary">₹{product.price}</span>
                    {product.originalPrice && (
                      <>
                        <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice}</span>
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-destructive text-destructive-foreground">-{discount}%</span>
                      </>
                    )}
                  </>
                )}
              </div>

              {welcomeActive && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 bg-primary/5 border border-primary/20">
                  <span className="text-lg">✦</span>
                  <div>
                    <p className="text-xs font-bold text-primary">Your welcome discount is active!</p>
                    <p className="text-[11px] text-muted-foreground">10% off auto-applied on your first order at checkout</p>
                  </div>
                </div>
              )}

              {couponDiscountedPrice && !welcomeActive && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700/40">
                  <span className="text-lg">✦</span>
                  <div>
                    <p className="text-xs font-bold text-violet-700 dark:text-violet-300">Offer auto-applied!</p>
                    <p className="text-[11px] text-muted-foreground">Discount applied automatically at checkout — no code needed</p>
                  </div>
                </div>
              )}

              {flashSale && (
                <div className="mb-6">
                  <FlashSaleTimer endsAt={flashSale.endsAt} discount={flashSale.discount} label={flashSale.label} />
                </div>
              )}

              <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

              <div className="flex items-center gap-6 mb-8">
                <span className="text-sm font-medium text-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-full">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-muted/50 rounded-l-full transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="px-5 text-sm font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-muted/50 rounded-r-full transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { addToCart(product, quantity); toast.success(`${product.name} added to cart!`); }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all hover:shadow-[0_0_30px_hsl(40_60%_50%/0.3)]"
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button
                  onClick={() => {
                    if (wishlisted) { removeFromWishlist(product.id); toast.info("Removed from wishlist"); }
                    else { addToWishlist(product); toast.success("Added to wishlist"); }
                  }}
                  className={`p-4 rounded-full border transition-all ${wishlisted ? "border-destructive/50 text-destructive bg-destructive/10" : "border-border text-foreground hover:border-primary/50"}`}
                >
                  <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
                </button>
              </div>
            </motion.div>
          </div>

          <div className="mt-16">
            <div className="flex gap-6 border-b border-border mb-8">
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-medium transition-all relative ${activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  {tab}
                  {activeTab === tab && <motion.span layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
              ))}
            </div>
            <div className="max-w-3xl">
              {activeTab === "Description" && <p className="text-muted-foreground leading-relaxed">{product.description}</p>}
              {activeTab === "Reviews" && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this product.</p>
                </div>
              )}
              {activeTab === "Specifications" && (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check size={14} className="text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-20">
              <ScrollReveal>
                <h2 className="font-display text-2xl font-bold mb-8">You May Also Like</h2>
              </ScrollReveal>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {related.map((p, i) => (
                  <ScrollReveal key={p.id} delay={i * 0.08}>
                    <ProductCard product={p} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetails;
