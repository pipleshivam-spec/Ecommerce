import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/data/dynamicProducts";

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Product[]>([]);

  const addToWishlist = (product: Product) => {
    setItems((prev) => (prev.find((i) => i.id === product.id) ? prev : [...prev, product]));
  };

  const removeFromWishlist = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  };

  const isInWishlist = (productId: number) => items.some((i) => i.id === productId);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, totalItems: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
