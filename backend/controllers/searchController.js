const searchService = require('../services/searchService');

class SearchController {
  // Search products
  async searchProducts(req, res) {
    try {
      const {
        q: query,
        category,
        min_price,
        max_price,
        min_rating,
        sort_by,
        page,
        limit
      } = req.query;

      const result = await searchService.searchProducts({
        query,
        category,
        min_price: min_price ? parseFloat(min_price) : 0,
        max_price: max_price ? parseFloat(max_price) : 999999,
        min_rating: min_rating ? parseFloat(min_rating) : 0,
        sort_by,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20
      });

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Search products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search products'
      });
    }
  }

  // Get search suggestions
  async getSearchSuggestions(req, res) {
    try {
      const { q: query, limit } = req.query;

      if (!query || query.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Query must be at least 2 characters'
        });
      }

      const suggestions = await searchService.getSearchSuggestions(
        query,
        limit ? parseInt(limit) : 5
      );

      res.status(200).json({
        success: true,
        data: suggestions
      });

    } catch (error) {
      console.error('Get suggestions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get suggestions'
      });
    }
  }

  // Get available filters
  async getAvailableFilters(req, res) {
    try {
      const { q: query } = req.query;

      const filters = await searchService.getAvailableFilters(query);

      res.status(200).json({
        success: true,
        data: filters
      });

    } catch (error) {
      console.error('Get filters error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get filters'
      });
    }
  }
}

module.exports = new SearchController();
