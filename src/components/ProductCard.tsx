import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/data/dynamicProducts";
import { Heart, ShoppingBag, Eye, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import FlashSaleTimer from "@/components/FlashSaleTimer";
import {
  getActiveFlashSale, FlashSale,
  hasWelcomeOffer, WELCOME_DISCOUNT,
  getActiveCoupon, CouponOffer,
  getActiveBxGy, BxGyOffer,
} from "@/lib/offersStore";

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [welcomeActive, setWelcomeActive] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<CouponOffer | null>(null);
  const [bxgyOffer, setBxgyOffer] = useState<BxGyOffer | null>(null);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  useEffect(() => {
    setFlashSale(getActiveFlashSale());
    setActiveCoupon(getActiveCoupon());
    setBxgyOffer(getActiveBxGy());

    const checkWelcome = () => {
      try {
        const userRaw = localStorage.getItem("user");
        if (!userRaw) { setWelcomeActive(false); return; }
        setWelcomeActive(hasWelcomeOffer(String(JSON.parse(userRaw).id)));
      } catch { setWelcomeActive(false); }
    };
    checkWelcome();

    const handler = (e: StorageEvent) => {
      if (e.key === "flash_sales") setFlashSale(getActiveFlashSale());
      if (e.key === "store_offers") setActiveCoupon(getActiveCoupon());
      if (e.key === "bxgy_offers") setBxgyOffer(getActiveBxGy());
      if (e.key === "maison_welcome_offer" || e.key === "maison_welcome_used" || e.key === "user") checkWelcome();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Compute discounted prices
  const couponDiscountedPrice = activeCoupon
    ? activeCoupon.type === "percentage"
      ? Math.round(product.price * (1 - activeCoupon.discount / 100))
      : Math.max(0, product.price - activeCoupon.discount)
    : null;

  const welcomePrice = welcomeActive
    ? Math.round(product.price * (1 - WELCOME_DISCOUNT / 100))
    : null;

  // Priority: welcome > coupon > flash > regular
  const showWelcome = welcomeActive && welcomePrice;
  const showCoupon = !showWelcome && activeCoupon && couponDiscountedPrice;
  const showBxGy = !showWelcome && !showCoupon && bxgyOffer;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (wishlisted) { removeFromWishlist(product.id); toast.info("Removed from wishlist"); }
    else { addToWishlist(product); toast.success("Added to wishlist"); }
  };

  return (
    <motion.div
      className="group glass-card overflow-hidden relative"
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Left badge */}
      {product.badge && (
        <span className={`absolute top-3 left-3 z-10 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
          product.badge === "Sale" ? "bg-destructive text-destructive-foreground" :
          product.badge === "New" ? "gold-gradient text-primary-foreground" :
          "bg-foreground text-background"
        }`}>
          {product.badge}
        </span>
      )}

      {/* Right badge — priority: flash > welcome > coupon > regular */}
      {flashSale ? (
        <div className="absolute top-3 right-3 z-10">
          <FlashSaleTimer endsAt={flashSale.endsAt} compact discount={flashSale.discount} />
        </div>
      ) : showWelcome ? (
        <span className="absolute top-3 right-3 z-10 text-[10px] font-black px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
          -{WELCOME_DISCOUNT}% FOR YOU
        </span>
      ) : showCoupon ? (
        <span className="absolute top-3 right-3 z-10 text-[10px] font-black px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700">
          -{activeCoupon!.type === "percentage" ? `${activeCoupon!.discount}%` : `₹${activeCoupon!.discount}`} OFF
        </span>
      ) : showBxGy ? (
        <span className="absolute top-3 right-3 z-10 text-[10px] font-black px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700">
          Buy {bxgyOffer!.buyQty} Get {bxgyOffer!.getFreeQty} Free
        </span>
      ) : discount > 0 ? (
        <span className="absolute top-3 right-3 z-10 text-[10px] font-bold px-2 py-1 rounded-full bg-destructive text-destructive-foreground">
          -{discount}%
        </span>
      ) : null}

      {/* Image */}
      <div className="aspect-[3/4] overflow-hidden bg-white relative">
        <img
          src={product.image} alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))" }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-3 translate-y-0 sm:translate-y-full sm:group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex gap-1 sm:gap-2">
            <button onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 sm:py-2.5 rounded-md gold-gradient text-primary-foreground text-[10px] sm:text-xs font-semibold hover:opacity-90 transition-opacity min-w-0">
              <ShoppingBag size={11} className="shrink-0" />
              <span className="truncate">Add to Cart</span>
            </button>
            <Link to={`/product/${product.id}`}
              className="p-1.5 sm:p-2.5 rounded-md bg-background/80 backdrop-blur-sm text-foreground hover:bg-background transition-colors shrink-0">
              <Eye size={11} />
            </Link>
            <button onClick={handleWishlist}
              className={`p-1.5 sm:p-2.5 rounded-md backdrop-blur-sm transition-colors shrink-0 ${
                wishlisted ? "bg-destructive/20 text-destructive" : "bg-background/80 text-foreground hover:bg-background"
              }`}>
              <Heart size={11} fill={wishlisted ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] text-primary font-medium uppercase tracking-widest mb-1">{product.category}</p>
        <h3 className="font-display text-sm font-semibold text-foreground mb-2 line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={10} className={i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-muted-foreground/30"} />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">({product.reviews})</span>
        </div>

        {/* Price */}
        {showWelcome ? (
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-primary">₹{welcomePrice}</span>
              <span className="text-xs text-muted-foreground line-through">₹{product.price}</span>
            </div>
            <p className="text-[10px] text-primary/70 font-semibold mt-0.5">✦ {WELCOME_DISCOUNT}% welcome discount</p>
          </div>
        ) : showCoupon ? (
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-violet-600 dark:text-violet-400">₹{couponDiscountedPrice}</span>
              <span className="text-xs text-muted-foreground line-through">₹{product.price}</span>
            </div>
            <p className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold mt-0.5">
              ✦ Coupon <span className="font-mono tracking-wider">{activeCoupon!.code}</span> applied
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-primary">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>
            )}
            {flashSale && (
              <span className="text-xs font-bold text-red-500">
                ₹{Math.round(product.price * (1 - flashSale.discount / 100))} after sale
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
