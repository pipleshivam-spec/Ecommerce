import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { products, categories } from "@/data/dynamicProducts";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { motion } from "framer-motion";

const Categories = () => {
  const categoryData = categories.slice(1).map(cat => ({
    name: cat,
    image: products.find(p => p.category === cat)?.image || "/images/placeholder.jpg",
    desc: `Discover our premium ${cat} collection.`,
    count: products.filter(p => p.category === cat).length
  }));

  return (
  <Layout>
    <section className="pt-28 pb-8">
      <div className="container-main text-center">
        <p className="text-primary text-xs font-medium tracking-[0.4em] uppercase mb-3">Browse</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold">Categories</h1>
      </div>
    </section>

    <section className="pb-20">
      <div className="container-main space-y-6">
        {categoryData.map((cat, i) => (
          <ScrollReveal key={cat.name} delay={i * 0.1}>
            <Link to={`/products?category=${cat.name}`}>
              <motion.div
                className="glass-card overflow-hidden grid grid-cols-1 md:grid-cols-2 group"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`aspect-video md:aspect-auto overflow-hidden ${i % 2 !== 0 ? "md:order-2" : ""}`}>
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <p className="text-primary text-xs font-medium tracking-[0.3em] uppercase mb-2">{cat.count} Products</p>
                  <h2 className="font-display text-3xl font-bold mb-4">{cat.name}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">{cat.desc}</p>
                  <span className="text-primary font-medium text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                    Shop {cat.name} <ArrowRight size={14} />
                  </span>
                </div>
              </motion.div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  </Layout>
  );
};

export default Categories;
