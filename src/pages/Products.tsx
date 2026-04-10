import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/dynamicProducts";
import { Search, SlidersHorizontal } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const sortOptions = [
  { label: "Default", value: "default" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
  { label: "Rating", value: "rating" },
];

const Products = () => {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get("category") || "All";

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesPrice = p.price >= priceRange[0] && (priceRange[1] === 5000 || p.price <= priceRange[1]);
      return matchesSearch && matchesCategory && matchesPrice;
    });

    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "newest": result.sort((a, b) => b.id - a.id); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [search, activeCategory, sortBy, priceRange]);

  return (
    <Layout>
      <section className="pt-28 pb-8">
        <div className="container-main text-center">
          <p className="text-primary text-xs font-medium tracking-[0.4em] uppercase mb-3">Collection</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">Our Shop</h1>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Discover our curated collection of premium fashion pieces.</p>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-main">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-card border border-border rounded-full text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-full text-sm text-muted-foreground hover:border-primary/50 transition-colors sm:hidden"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>

          <div className={`flex gap-2 flex-wrap mb-4 ${showFilters ? '' : 'hidden sm:flex'}`}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "gold-gradient text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={`mb-8 ${showFilters ? '' : 'hidden sm:block'}`}>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">Price:</span>
              <input type="range" min={0} max={5000} value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="flex-1 max-w-xs accent-primary" />
              <span className="text-sm font-medium text-foreground">₹{priceRange[0]} – ₹{priceRange[1] === 5000 ? '5000+' : priceRange[1]}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-6">{filtered.length} products found</p>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 0.04}>
                  <ProductCard product={p} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Products;
