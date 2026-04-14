import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import HeroSection from "@/components/HeroSection";
import { products, categories } from "@/data/dynamicProducts";
import { ArrowRight, Star, Truck, Shield, Headphones, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { motion } from "framer-motion";
import { useState } from "react";
import WelcomeCelebration from "@/components/WelcomeCelebration";

const Index = () => {
  const featured = products.slice(0, 8);
  const newArrivals = products.slice(8, 12);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const categoryCards = categories.slice(1, 9).map(cat => ({
    name: cat,
    image: products.find(p => p.category === cat)?.image || "/images/placeholder.jpg",
    count: products.filter(p => p.category === cat).length
  }));

  const testimonials = [
    { name: "James W.", text: "Exceptional quality. The blazer fits perfectly and the fabric is outstanding. I've never felt more confident.", rating: 5, role: "Business Owner" },
    { name: "Sarah K.", text: "MAISON has become my go-to for premium fashion. Every piece feels luxurious and the customer service is incredible.", rating: 5, role: "Fashion Designer" },
    { name: "David L.", text: "From the packaging to the product — everything screams luxury. My wardrobe has never looked better.", rating: 5, role: "Architect" },
    { name: "Emma R.", text: "The silk dress I ordered exceeded my expectations. The quality is unmatched at this price point.", rating: 5, role: "Marketing Director" },
  ];

  return (
    <Layout>
      <WelcomeCelebration />
      {/* Hero Section */}
      <HeroSection type="slider" />

      {/* Features Bar */}
      <section className="bg-card border-y border-border/50">
        <div className="container-main py-6 sm:py-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {[
            { icon: Truck, title: "Free Shipping", desc: "On orders over ₹200" },
            { icon: Shield, title: "Quality Guarantee", desc: "Premium materials" },
            { icon: CreditCard, title: "Secure Payment", desc: "100% protected" },
            { icon: Headphones, title: "24/7 Support", desc: "Always here for you" },
          ].map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.1}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <f.icon className="text-primary" size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-xs sm:text-sm">{f.title}</h4>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding">
        <div className="container-main">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-primary text-xs font-medium tracking-[0.4em] uppercase mb-3">Browse</p>
              <h2 className="font-display text-2xl sm:text-4xl font-bold">Shop by Category</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {categoryCards.map((cat, i) => (
              <ScrollReveal key={cat.name} delay={i * 0.08}>
                <Link to={`/products?category=${cat.name}`} className="group relative aspect-[3/4] overflow-hidden rounded-xl block">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                    <h3 className="font-display text-sm sm:text-lg font-bold text-foreground">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground hidden sm:block">{cat.count} Products</p>
                    <span className="text-primary text-xs font-medium flex items-center gap-1 mt-2 group-hover:gap-2 transition-all">
                      Explore <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-card/30">
        <div className="container-main">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-primary text-xs font-medium tracking-[0.4em] uppercase mb-3">Curated Selection</p>
                <h2 className="font-display text-2xl sm:text-4xl font-bold">Featured Products</h2>
              </div>
              <Link to="/products" className="hidden sm:inline-flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all">
                View All <ArrowRight size={14} />
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 0.06}>
                <ProductCard product={p} />
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal>
            <div className="text-center mt-10 sm:hidden">
              <Link to="/products" className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all">
                View All Products <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section-padding">
        <div className="container-main">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-primary text-xs font-medium tracking-[0.4em] uppercase mb-3">Just Arrived</p>
              <h2 className="font-display text-2xl sm:text-4xl font-bold">New Arrivals</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 0.08}>
                <ProductCard product={p} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-card/50">
        <div className="container-main">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-primary text-xs font-medium tracking-[0.4em] uppercase mb-3">Why MAISON</p>
              <h2 className="font-display text-2xl sm:text-4xl font-bold">Why Choose Us</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Fast Delivery", desc: "Free shipping worldwide on all orders over ₹200 with tracking." },
              { icon: Shield, title: "Quality Products", desc: "Every item is crafted from the finest materials with meticulous attention." },
              { icon: CreditCard, title: "Secure Payment", desc: "Your transactions are protected with enterprise-grade encryption." },
              { icon: Headphones, title: "24/7 Support", desc: "Our dedicated team is available around the clock to assist you." },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.1}>
                <motion.div className="glass-card p-5 sm:p-8 text-center" whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                  <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center mx-auto mb-5">
                    <item.icon size={24} className="text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="container-main">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-primary text-xs font-medium tracking-[0.4em] uppercase mb-3">Testimonials</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">What Our Clients Say</h2>
            </div>
          </ScrollReveal>
          <div className="max-w-3xl mx-auto relative">
            <motion.div key={testimonialIdx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass-card p-6 sm:p-10 text-center">
              <div className="flex justify-center gap-1 mb-4 sm:mb-6">
                {Array.from({ length: testimonials[testimonialIdx].rating }).map((_, j) => (
                  <Star key={j} size={16} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm sm:text-lg leading-relaxed mb-5 sm:mb-8 italic">"{testimonials[testimonialIdx].text}"</p>
              <p className="font-display font-semibold text-foreground text-lg">{testimonials[testimonialIdx].name}</p>
              <p className="text-xs text-muted-foreground mt-1">{testimonials[testimonialIdx].role}</p>
            </motion.div>
            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => setTestimonialIdx((i) => (i - 1 + testimonials.length) % testimonials.length)} className="p-2 rounded-full border border-border hover:border-primary/50 transition-colors">
                <ChevronLeft size={18} className="text-muted-foreground" />
              </button>
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setTestimonialIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? "bg-primary w-6" : "bg-muted-foreground/30"}`} />
              ))}
              <button onClick={() => setTestimonialIdx((i) => (i + 1) % testimonials.length)} className="p-2 rounded-full border border-border hover:border-primary/50 transition-colors">
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <ScrollReveal>
        <section className="section-padding bg-card/50">
          <div className="container-main text-center max-w-2xl mx-auto">
            <p className="text-primary text-xs font-medium tracking-[0.4em] uppercase mb-3">Stay Updated</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Join Our Newsletter</h2>
            <p className="text-muted-foreground mb-8">Subscribe to get exclusive access to new arrivals, special offers, and style tips.</p>
            <form onSubmit={(e) => { e.preventDefault(); }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="Your email address" className="flex-1 px-5 py-3 bg-background border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm" />
              <button type="submit" className="px-8 py-3 rounded-full gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </ScrollReveal>
    </Layout>
  );
};

export default Index;
