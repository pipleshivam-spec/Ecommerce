import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { heroImages, heroImages2 } from "@/data/dynamicProducts";

type HeroType = "video" | "gif" | "slider" | "static";

interface HeroSectionProps {
  type?: HeroType;
  videoSrc?: string;
  gifSrc?: string;
  images?: string[];
  staticImage?: string;
}

const HeroSection = ({ 
  type = "slider", 
  videoSrc = "/assets/video/hero.mp4",
  gifSrc = "/assets/images/hero.gif",
  images = [...heroImages, ...heroImages2],
  staticImage = "/images/hero-banner.jpg"
}: HeroSectionProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto slide for image slider
  useEffect(() => {
    if (type === "slider" && isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [type, isAutoPlaying, images.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        {/* Video Background */}
        {type === "video" && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        {/* GIF Background */}
        {type === "gif" && (
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${gifSrc})` }}
          />
        )}

        {/* Image Slider Background */}
        {type === "slider" && (
          <div className="relative w-full h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${images[currentSlide]})` }}
              />
            </AnimatePresence>

            {/* Slider Controls */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/20 backdrop-blur-sm border border-white/20 text-white hover:bg-background/30 transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/20 backdrop-blur-sm border border-white/20 text-white hover:bg-background/30 transition-all"
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>

            {/* Dots Navigation */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide 
                      ? "bg-white w-8" 
                      : "bg-white/50 w-2 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Static Image Background */}
        {type === "static" && (
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${staticImage})` }}
          />
        )}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 container-main pt-24 w-full">
        <div className="max-w-2xl">
          {/* Subtitle with fade animation */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-primary font-medium tracking-[0.4em] uppercase text-xs mb-6"
          >
            New Collection 2026
          </motion.p>

          {/* Main Heading with fade animation */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6"
          >
            Modern Fashion <br />
            <span className="gold-text">Store</span>
          </motion.h1>

          {/* Description with fade animation */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-muted-foreground text-lg mb-10 leading-relaxed max-w-lg"
          >
            Premium Quality Products - Discover timeless elegance with our curated collection of premium fashion, crafted for the modern individual.
          </motion.p>

          {/* Buttons with slide animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full gold-gradient text-primary-foreground font-semibold text-sm tracking-wide hover:opacity-90 transition-all hover:shadow-[0_0_40px_hsl(40_60%_50%/0.4)] hover:scale-105 duration-300"
            >
              Shop Now <ArrowRight size={16} />
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-border text-foreground font-semibold text-sm tracking-wide hover:border-primary/50 transition-all hover:scale-105 duration-300 bg-background/50 backdrop-blur-sm"
            >
              Explore <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
