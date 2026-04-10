const { pool } = require('./config/db');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Seed Categories
    const categories = ['Men', 'Women', 'Shoes', 'Accessories', 'Bags'];
    const categoryIds = {};

    for (const catName of categories) {
      const existing = await Category.findByName(catName);
      if (!existing) {
        const cat = await Category.create(catName);
        categoryIds[catName] = cat.id;
        console.log(`✅ Created category: ${catName}`);
      } else {
        categoryIds[catName] = existing.id;
        console.log(`⏭️  Category already exists: ${catName}`);
      }
    }

    // Seed Products
    const products = [
      {
        name: 'Classic Navy Blazer',
        price: 299.99,
        category: 'Men',
        description: 'Elegant navy blazer perfect for formal occasions',
        image_url: '/images/product-1.jpg',
        stock: 50,
        rating: 4.8,
        reviews: 124,
        badge: 'Best Seller'
      },
      {
        name: 'Slim Fit Dress Shirt',
        price: 89.99,
        category: 'Men',
        description: 'Premium cotton dress shirt with modern fit',
        image_url: '/images/product-2.jpg',
        stock: 100,
        rating: 4.6,
        reviews: 89,
        badge: null
      },
      {
        name: 'Elegant Evening Dress',
        price: 249.99,
        category: 'Women',
        description: 'Stunning evening dress for special occasions',
        image_url: '/images/product-3.jpg',
        stock: 30,
        rating: 4.9,
        reviews: 156,
        badge: 'New'
      },
      {
        name: 'Casual Summer Dress',
        price: 129.99,
        category: 'Women',
        description: 'Light and comfortable summer dress',
        image_url: '/images/product-4.jpg',
        stock: 75,
        rating: 4.7,
        reviews: 92,
        badge: null
      },
      {
        name: 'Leather Oxford Shoes',
        price: 179.99,
        category: 'Shoes',
        description: 'Handcrafted leather oxford shoes',
        image_url: '/images/product-5.jpg',
        stock: 60,
        rating: 4.8,
        reviews: 143,
        badge: 'Best Seller'
      },
      {
        name: 'Designer Handbag',
        price: 399.99,
        category: 'Bags',
        description: 'Luxury designer handbag with premium leather',
        image_url: '/images/product-6.jpg',
        stock: 25,
        rating: 4.9,
        reviews: 201,
        badge: 'New'
      },
      {
        name: 'Classic Watch',
        price: 499.99,
        category: 'Accessories',
        description: 'Elegant timepiece with Swiss movement',
        image_url: '/images/product-7.jpg',
        stock: 40,
        rating: 4.8,
        reviews: 167,
        badge: 'Best Seller'
      },
      {
        name: 'Leather Belt',
        price: 59.99,
        category: 'Accessories',
        description: 'Premium leather belt with silver buckle',
        image_url: '/images/product-8.jpg',
        stock: 150,
        rating: 4.5,
        reviews: 78,
        badge: null
      }
    ];

    for (const prod of products) {
      const categoryId = categoryIds[prod.category];
      await Product.create(
        prod.name,
        prod.price,
        categoryId,
        prod.description,
        prod.image_url,
        prod.stock,
        prod.rating,
        prod.reviews,
        prod.badge
      );
      console.log(`✅ Created product: ${prod.name}`);
    }

    console.log('');
    console.log('✅ Database seeding completed successfully!');
    console.log('');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
