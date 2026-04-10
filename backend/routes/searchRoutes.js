const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// All search routes are public
router.get('/', searchController.searchProducts);
router.get('/suggestions', searchController.getSearchSuggestions);
router.get('/filters', searchController.getAvailableFilters);

module.exports = router;
