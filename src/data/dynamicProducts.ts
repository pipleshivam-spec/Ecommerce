export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  images: string[];
  description: string;
  features: string[];
  badge?: string;
  rating: number;
  reviews: number;
}

// Auto-generate products from folder structure
const productCategories: { folder: string; name: string; price: number; desc: string }[] = [
  { folder: "Backpack", name: "Modern Backpack", price: 1299, desc: "Durable and stylish backpack with multiple compartments" },
  { folder: "Brown Belt", name: "Leather Belt", price: 599, desc: "Premium leather belt with classic buckle" },
  { folder: "Cap", name: "Signature Cap", price: 449, desc: "Structured cotton cap with embroidered logo and adjustable strap" },
  { folder: "Casual Shoes", name: "Casual Sneakers", price: 1799, desc: "Comfortable sneakers with cushioned sole and modern silhouette" },
  { folder: "Denim Jeans", name: "Premium Denim Jeans", price: 1399, desc: "Classic fit denim jeans with premium fabric" },
  { folder: "Formal Shirt", name: "Formal Dress Shirt", price: 999, desc: "Cotton dress shirt with spread collar, perfect for office wear" },
  { folder: "Hand Bag", name: "Designer Hand Bag", price: 2499, desc: "Elegant handbag with spacious interior and quality hardware" },
  { folder: "Headphones", name: "Wireless Headphones", price: 2999, desc: "Noise-cancelling headphones with premium sound quality" },
  { folder: "Hoodie", name: "Comfort Hoodie", price: 1099, desc: "Soft and warm hoodie for casual everyday wear" },
  { folder: "Jacket", name: "Stylish Jacket", price: 2199, desc: "Weather-resistant jacket with a modern tailored silhouette" },
  { folder: "Leather Wallet", name: "Leather Wallet", price: 799, desc: "Genuine leather bifold wallet with card slots" },
  { folder: "MEN", name: "Signature T-Shirt", price: 499, desc: "Premium cotton crew-neck tee for everyday comfort" },
  { folder: "Polo T-Shirt", name: "Polo T-Shirt", price: 799, desc: "Classic polo shirt with modern slim fit" },
  { folder: "Running Shoes", name: "Running Shoes", price: 2499, desc: "Lightweight running shoes with superior grip and cushioning" },
  { folder: "Sneakers Shoes", name: "Fashion Sneakers", price: 1999, desc: "Trendy sneakers with premium materials and clean design" },
  { folder: "Sports Jacket", name: "Sports Jacket", price: 1799, desc: "Athletic jacket with moisture-wicking fabric" },
  { folder: "Sunglasses", name: "Aviator Sunglasses", price: 1299, desc: "Polarized aviators with UV400 protection" },
  { folder: "Wrist Watch", name: "Luxury Watch", price: 4999, desc: "Elegant timepiece with precision movement and leather strap" },
];

// Get all images from a folder
const getImagesFromFolder = (folder: string): string[] => {
  const imageMap: Record<string, string[]> = {
    "Backpack": [
      "/Backpack/a-professional-product-photography-shot-_oqFuQoIQRzWn1oSqJgqPjA_ro0SSv3mSuG4mR-U4rwhcQ.jpeg",
      "/Backpack/professional-ecommerce-product-image-of-_E2ZVo877ScGpbEZ-ZsSu7Q_ro0SSv3mSuG4mR-U4rwhcQ_cover.jpeg",
      "/Backpack/professional-ecommerce-product-image-of-_G93Pfap2RTKyIroe-DQZRw_ro0SSv3mSuG4mR-U4rwhcQ.jpeg",
      "/Backpack/professional-ecommerce-product-image-of-_tSQqzZyWTxeHSAPgvK0HYA_ro0SSv3mSuG4mR-U4rwhcQ.jpeg",
    ],
    "Brown Belt": ["/Brown Belt/lucid-origin_Professional_ecommerce_product_image_of_a_brown_leather_belt._Minimal_white_back-0.jpg"],
    "Cap": [
      "/Cap/a-professional-ecommerce-product-photogr_mZZErYbDTm2ikgYpal4hyA_BhPI35MUQomvryjyWkowIw.jpeg",
      "/Cap/professional-ecommerce-product-image-of-_Tl21yw2SThWK4mu99oo42A_BhPI35MUQomvryjyWkowIw_cover.jpeg",
    ],
    "Casual Shoes": [
      "/Casual Shoes/a-professional-ecommerce-product-photogr_2Svv0RwpRnOtyTCrBPyefg_CItL-r8USne49uzXv-3ACg_cover.jpeg",
      "/Casual Shoes/a-professional-product-photograph-of-cas_voSMe8NUR8W0S_q8JrNTpg_CItL-r8USne49uzXv-3ACg.jpeg",
    ],
    "Denim Jeans": ["/Denim Jeans/lucid-origin_Professional_ecommerce_product_image_of_blue_denim_jeans._Folded_style._Clean_wh-0.jpg"],
    "Formal Shirt": [
      "/Formal Shirt/a-professional-ecommerce-product-photogr_Mj4YVMjLS5GED-q1vP8qDA_clUoQur1RzGJjZXZB-42Zg_cover.jpeg",
      "/Formal Shirt/a-professional-ecommerce-product-photogr_v8_EM5QJSm2sucrQsB2fZw_clUoQur1RzGJjZXZB-42Zg.jpeg",
    ],
    "Hand Bag": [
      "/Hand Bag/a-professional-ecommerce-product-photogr_iEfqT_BhTf2tkDV9CsWLeQ_ONkPlWq4QUWu8vpCr4pbWQ.jpeg",
      "/Hand Bag/a-professional-product-photograph-of-an-_f1zDfW7ERJmTTZxcZqKBlg_ONkPlWq4QUWu8vpCr4pbWQ_cover.jpeg",
    ],
    "Headphones": [
      "/Headphones/professional-ecommerce-product-image-of-_oIYzmKUfSwCalpQHz8A8vA_nx5V6TetTcO70HzMOsawuA_cover.jpeg",
      "/Headphones/professional-ecommerce-product-image-of-_tvrCyH_lQEmLceW2lYJd2g_nx5V6TetTcO70HzMOsawuA.jpeg",
    ],
    "Hoodie": [
      "/Hoodie/a-professional-ecommerce-product-photogr_JexovM3NS4Kqh5t6_lLHMA_lw29f09kT-CXW5OROvAGXg_cover.jpeg",
      "/Hoodie/a-professional-product-photograph-of-a-b_tf6LkJkBRjir-9vxC7p2Lg_lw29f09kT-CXW5OROvAGXg.jpeg",
    ],
    "Jacket": [
      "/Jacket/a-collection-of-four-professional-ecomme_WP-FcnfoR-qN1yyIps80eA_pGKhLO9NT7i7Ncwn-vHyQQ.jpeg",
      "/Jacket/a-professional-ecommerce-product-photogr_2YtjdjBAQeKsQfkbOVz5eg_F4Hf7hB-Rt6mFslvxFLsNA_cover.jpeg",
      "/Jacket/a-professional-ecommerce-product-photogr_UDPvUKKkQICPC8V_0ZVCqQ_pGKhLO9NT7i7Ncwn-vHyQQ_cover.jpeg",
      "/Jacket/a-professional-studio-photograph-of-a-sl_rOGcuNizTvK1iujfct_3bQ_F4Hf7hB-Rt6mFslvxFLsNA.jpeg",
    ],
    "Leather Wallet": [
      "/Leather Wallet/professional-ecommerce-product-image-of-_kLIET4TwSDCwW8VR8BFOtg_6tRthMZ4RQa8BPPvP5q1SA.jpeg",
      "/Leather Wallet/professional-ecommerce-product-image-of-_QMrJLSbnRt-1ZKWuz-0PMg_6tRthMZ4RQa8BPPvP5q1SA_cover.jpeg",
    ],
    "MEN": [
      "/MEN/lucid-origin_Professional_ecommerce_product_image_of_a_black_men_s_t-shirt._Minimal_backgroun-0.jpg",
      "/MEN/lucid-origin_Professional_ecommerce_product_photo_of_a_modern_white_men_s_t-shirt._Front_view-0.jpg",
    ],
    "Polo T-Shirt": [
      "/Polo T-Shirt/a-professional-ecommerce-product-photogr_0cUorHulTAW2FfihOuUFOA_JAfyIKw1REaVjTy3JbU8pw_cover.jpeg",
      "/Polo T-Shirt/a-professional-studio-photograph-of-a-me_op8WM5fcSpyVkjvUzQaTDQ_JAfyIKw1REaVjTy3JbU8pw.jpeg",
    ],
    "Running Shoes": [
      "/Running Shoes/a-professional-ecommerce-product-photogr_5KVt1QqXTbukyPSm0nux8Q_sJwMvkHBQW2NLn6AR4WCCw_cover.jpeg",
      "/Running Shoes/a-professional-ecommerce-product-photogr_x2pa2B6LRUaGX6DLoAeWTQ_sJwMvkHBQW2NLn6AR4WCCw.jpeg",
    ],
    "Sneakers Shoes": ["/Sneakers Shoes/lucid-origin_Professional_ecommerce_product_photo_of_modern_black_sneakers_shoes._Side_view._-0.jpg"],
    "Sports Jacket": [
      "/Sports Jacket/a-professional-ecommerce-product-photogr_7TyviHmQTPymo0Th-sQXyw_YHeJKrc2Rr6GsjF5wBqlSg_cover.jpeg",
      "/Sports Jacket/a-professional-product-photograph-of-a-s_SxW9F4q8TJWetqxBL_K0pg_YHeJKrc2Rr6GsjF5wBqlSg.jpeg",
    ],
    "Sunglasses": [
      "/Sunglasses/professional-ecommerce-product-image-of-_1_wdGvgXSLeaHCQ3LX2h4g_yMTTNuo1R3meT2yspWqe-Q_cover.jpeg",
      "/Sunglasses/professional-ecommerce-product-image-of-_F3QWFeCpS_2W0UifNTKzLA_yMTTNuo1R3meT2yspWqe-Q.jpeg",
      "/Sunglasses/professional-ecommerce-product-image-of-_iACaGkjiSkSlwfME-n-4yQ_yMTTNuo1R3meT2yspWqe-Q.jpeg",
      "/Sunglasses/professional-ecommerce-product-image-of-_pDhCc-oURl6mI-6hzS1oHQ_yMTTNuo1R3meT2yspWqe-Q.jpeg",
    ],
    "Wrist Watch": [
      "/Wrist Watch/a-professional-ecommerce-product-photogr_-lIscgQXQWWaehwFODZ1dQ_DmDhHFjgTvabIVglKA2zaA_cover.jpeg",
      "/Wrist Watch/a-professional-ecommerce-product-photogr_1DqJ8UyAT2upvsbVAs81bw_DmDhHFjgTvabIVglKA2zaA.jpeg",
      "/Wrist Watch/a-professional-ecommerce-product-photogr_NCGJHiYmTzifcCKjCjR08g_DmDhHFjgTvabIVglKA2zaA.jpeg",
      "/Wrist Watch/a-professional-ecommerce-product-photogr_ZsGiRILLQ6GSzqVGcSrVAw_DmDhHFjgTvabIVglKA2zaA.jpeg",
      "/Wrist Watch/lucid-origin_Professional_ecommerce_product_image_of_a_modern_luxury_wrist_watch._Minimal_bac-0.jpg",
    ],
  };
  return imageMap[folder] || [];
};

// Generate products dynamically with stable values
const stableRandom = (seed: number, min: number, max: number) => {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
};

export const products: Product[] = productCategories.map((cat, index) => {
  const images = getImagesFromFolder(cat.folder);
  return {
    id: index + 1,
    name: cat.name,
    price: cat.price,
    category: cat.folder,
    image: images[0] || "/placeholder.jpg",
    images: images.length > 0 ? images : ["/placeholder.jpg"],
    description: cat.desc,
    features: ["Premium Quality", "Fast Shipping", "Easy Returns", "Secure Payment"],
    rating: Math.round((4.5 + stableRandom(index + 1, 0, 0.5)) * 10) / 10,
    reviews: Math.floor(stableRandom(index + 100, 20, 220)),
  };
});

export const categories = ["All", ...productCategories.map(c => c.folder)];

// Hero slider images
export const heroImages = [
  "/Hero-section/a-premium-fashion-ecommerce-hero-banner-_xA7dAPaPR0GENhxL8MpH2Q_IIz8Bo-YQWugUGp6bPN0Uw.jpeg",
  "/Hero-section/a-professional-ecommerce-hero-banner-fea_azN4Cr5URoudMhxgWYMgDg_IIz8Bo-YQWugUGp6bPN0Uw.jpeg",
  "/Hero-section/a-professional-ecommerce-hero-banner-fea_XUYlVaQ2Sa61m6EfWwCmVw_IIz8Bo-YQWugUGp6bPN0Uw.jpeg",
  "/Hero-section/a-professional-ecommerce-hero-banner-pho_Md7KPQDZSyyolw48O4Kkrw_IIz8Bo-YQWugUGp6bPN0Uw_cover.jpeg",
];

export const heroImages2 = [
  "/Hero-section-2/a-professional-ecommerce-hero-banner-fea__BzrY0giTnW3wpKsQZR-cg_nZe5U2IEQNuyP7ZrUWST7A_cover.jpeg",
  "/Hero-section-2/a-professional-ecommerce-hero-banner-sho_eL1n4enIQy-mQ-Gi-XTEnA_nZe5U2IEQNuyP7ZrUWST7A.jpeg",
  "/Hero-section-2/a-professional-luxury-fashion-ecommerce-_I4nJWBVkTK-Q9MKyYGKXzg_nZe5U2IEQNuyP7ZrUWST7A.jpeg",
  "/Hero-section-2/a-sleek-4k-website-banner-featuring-a-st_CPIpB0EcS-CCHqW-vAzKLA_HCmzxznmQHmi_uYvgD2vIQ_cover.jpeg",
  "/Hero-section-2/a-sleek-luxury-fashion-ecommerce-hero-ba_azeO-q33T9m26Dlbrn4bEQ_nZe5U2IEQNuyP7ZrUWST7A.jpeg",
  "/Hero-section-2/a-sleek-website-hero-banner-featuring-a-_Jh2BxsSBRUWhUjdRSXCdgA_HCmzxznmQHmi_uYvgD2vIQ.jpeg",
  "/Hero-section-2/a-sleek-website-hero-banner-featuring-a-_pFSfr3FKSHCmgvVrGLg2kg_HCmzxznmQHmi_uYvgD2vIQ.jpeg",
  "/Hero-section-2/a-sleek-website-hero-banner-showcasing-a_nZWw84tdSFyXwUgm-y-c5w_HCmzxznmQHmi_uYvgD2vIQ.jpeg",
];

// Get product by ID
export const getProductById = (id: number): Product | undefined => {
  return products.find(p => p.id === id);
};

// Get products by category
export const getProductsByCategory = (category: string): Product[] => {
  if (category === "All") return products;
  return products.filter(p => p.category === category);
};
