const { pool } = require('../config/db');

class SearchService {
  // Full-text search with filters
  async searchProducts(params) {
    const {
      query = '',
      category = null,
      min_price = 0,
      max_price = 999999,
      min_rating = 0,
      sort_by = 'relevance',
      page = 1,
      limit = 20
    } = params;

    const offset = (page - 1) * limit;
    let orderBy = '';

    // Determine sort order
    switch (sort_by) {
      case 'price_asc':
        orderBy = 'ORDER BY p.price ASC';
        break;
      case 'price_desc':
        orderBy = 'ORDER BY p.price DESC';
        break;
      case 'rating':
        orderBy = 'ORDER BY p.rating DESC, p.reviews_count DESC';
        break;
      case 'newest':
        orderBy = 'ORDER BY p.created_at DESC';
        break;
      case 'popular':
        orderBy = 'ORDER BY p.reviews_count DESC, p.rating DESC';
        break;
      default: // relevance
        if (query) {
          orderBy = 'ORDER BY ts_rank(search_vector, plainto_tsquery($1)) DESC';
        } else {
          orderBy = 'ORDER BY p.created_at DESC';
        }
    }

    // Build query
    let searchQuery = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;

    const queryParams = [];
    let paramIndex = 1;

    // Full-text search
    if (query) {
      searchQuery += ` AND to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery($${paramIndex})`;
      queryParams.push(query);
      paramIndex++;
    }

    // Category filter
    if (category) {
      searchQuery += ` AND c.slug = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    // Price range filter
    searchQuery += ` AND p.price >= $${paramIndex}`;
    queryParams.push(min_price);
    paramIndex++;

    searchQuery += ` AND p.price <= $${paramIndex}`;
    queryParams.push(max_price);
    paramIndex++;

    // Rating filter
    if (min_rating > 0) {
      searchQuery += ` AND p.rating >= $${paramIndex}`;
      queryParams.push(min_rating);
      paramIndex++;
    }

    // Add order by
    searchQuery += ` ${orderBy}`;

    // Add pagination
    searchQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    // Execute search
    const result = await pool.query(searchQuery, queryParams);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;

    const countParams = [];
    let countParamIndex = 1;

    if (query) {
      countQuery += ` AND to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery($${countParamIndex})`;
      countParams.push(query);
      countParamIndex++;
    }

    if (category) {
      countQuery += ` AND c.slug = $${countParamIndex}`;
      countParams.push(category);
      countParamIndex++;
    }

    countQuery += ` AND p.price >= $${countParamIndex}`;
    countParams.push(min_price);
    countParamIndex++;

    countQuery += ` AND p.price <= $${countParamIndex}`;
    countParams.push(max_price);
    countParamIndex++;

    if (min_rating > 0) {
      countQuery += ` AND p.rating >= $${countParamIndex}`;
      countParams.push(min_rating);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalProducts = parseInt(countResult.rows[0].total);

    return {
      products: result.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalProducts / limit),
        total_products: totalProducts,
        per_page: parseInt(limit)
      }
    };
  }

  // Get search suggestions
  async getSearchSuggestions(query, limit = 5) {
    const searchQuery = `
      SELECT DISTINCT name, slug
      FROM products
      WHERE is_active = true
      AND name ILIKE $1
      ORDER BY name
      LIMIT $2
    `;

    const result = await pool.query(searchQuery, [`%${query}%`, limit]);
    return result.rows;
  }

  // Get available filters
  async getAvailableFilters(query = null) {
    // Get categories
    let categoryQuery = `
      SELECT DISTINCT c.id, c.name, c.slug, COUNT(p.id) as product_count
      FROM categories c
      JOIN products p ON c.id = p.category_id
      WHERE p.is_active = true
    `;

    const categoryParams = [];

    if (query) {
      categoryQuery += ` AND to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery($1)`;
      categoryParams.push(query);
    }

    categoryQuery += ` GROUP BY c.id, c.name, c.slug ORDER BY c.name`;

    const categories = await pool.query(categoryQuery, categoryParams);

    // Get price range
    let priceQuery = `
      SELECT 
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM products
      WHERE is_active = true
    `;

    const priceParams = [];

    if (query) {
      priceQuery += ` AND to_tsvector('english', name || ' ' || COALESCE(description, '')) @@ plainto_tsquery($1)`;
      priceParams.push(query);
    }

    const priceRange = await pool.query(priceQuery, priceParams);

    // Get rating distribution
    let ratingQuery = `
      SELECT 
        FLOOR(rating) as rating,
        COUNT(*) as count
      FROM products
      WHERE is_active = true AND rating > 0
    `;

    const ratingParams = [];

    if (query) {
      ratingQuery += ` AND to_tsvector('english', name || ' ' || COALESCE(description, '')) @@ plainto_tsquery($1)`;
      ratingParams.push(query);
    }

    ratingQuery += ` GROUP BY FLOOR(rating) ORDER BY rating DESC`;

    const ratings = await pool.query(ratingQuery, ratingParams);

    return {
      categories: categories.rows,
      price_range: priceRange.rows[0],
      ratings: ratings.rows
    };
  }
}

module.exports = new SearchService();
