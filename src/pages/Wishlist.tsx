import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/contexts/WishlistContext";
import { Heart, ArrowRight } from "lucide-react";

const Wishlist = () => {
  const { items } = useWishlist();

  return (
    <Layout>
      <section className="pt-28 pb-16 min-h-screen">
        <div className="container-main">
          <h1 className="font-display text-4xl font-bold mb-8">Wishlist</h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <Heart size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-lg mb-6">Your wishlist is empty</p>
              <Link to="/products" className="inline-flex items-center gap-2 px-8 py-3 rounded-full gold-gradient text-primary-foreground font-semibold text-sm">
                Browse Products <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Wishlist;
