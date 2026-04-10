const Review = require('../models/reviewModel');

class ReviewController {
  // Create review
  async createReview(req, res) {
    try {
      const userId = req.user.id;
      const { product_id, order_id, rating, title, comment, images } = req.body;

      // Validate input
      if (!product_id || !rating) {
        return res.status(400).json({
          success: false,
          message: 'Product ID and rating are required'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      // Check if user already reviewed
      const hasReviewed = await Review.hasUserReviewed(userId, product_id);
      if (hasReviewed) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this product'
        });
      }

      // Check if user can review (purchased the product)
      const canReview = await Review.canUserReview(userId, product_id);
      if (!canReview) {
        return res.status(403).json({
          success: false,
          message: 'You can only review products you have purchased'
        });
      }

      // Create review
      const review = await Review.create(
        product_id,
        userId,
        order_id || null,
        rating,
        title || null,
        comment || null,
        images || []
      );

      // Update product rating
      await Review.updateProductRating(product_id);

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review
      });

    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create review'
      });
    }
  }

  // Get product reviews
  async getProductReviews(req, res) {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Get reviews
      const reviews = await Review.getByProduct(productId, limit, offset);

      // Get total count
      const totalReviews = await Review.getCountByProduct(productId);

      // Get rating distribution
      const ratingDistribution = await Review.getRatingDistribution(productId);

      res.status(200).json({
        success: true,
        data: {
          reviews,
          rating_distribution: ratingDistribution,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(totalReviews / limit),
            total_reviews: totalReviews,
            per_page: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get product reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews'
      });
    }
  }

  // Update review
  async updateReview(req, res) {
    try {
      const userId = req.user.id;
      const { reviewId } = req.params;
      const { rating, title, comment, images } = req.body;

      // Get review
      const review = await Review.getById(reviewId);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Check ownership
      if (review.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own reviews'
        });
      }

      // Validate rating
      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      // Update review
      const updatedReview = await Review.update(
        reviewId,
        rating || review.rating,
        title || review.title,
        comment || review.comment,
        images || review.images
      );

      // Update product rating
      await Review.updateProductRating(review.product_id);

      res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: updatedReview
      });

    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update review'
      });
    }
  }

  // Delete review
  async deleteReview(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const { reviewId } = req.params;

      // Get review
      const review = await Review.getById(reviewId);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Check ownership or admin
      if (review.user_id !== userId && userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own reviews'
        });
      }

      // Delete review
      await Review.delete(reviewId);

      // Update product rating
      await Review.updateProductRating(review.product_id);

      res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
      });

    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete review'
      });
    }
  }

  // Mark review as helpful
  async markHelpful(req, res) {
    try {
      const { reviewId } = req.params;

      // Get review
      const review = await Review.getById(reviewId);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Mark as helpful
      const result = await Review.markHelpful(reviewId);

      res.status(200).json({
        success: true,
        message: 'Review marked as helpful',
        data: {
          helpful_count: result.helpful_count
        }
      });

    } catch (error) {
      console.error('Mark helpful error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark review as helpful'
      });
    }
  }

  // Check if user can review product
  async checkCanReview(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;

      const canReview = await Review.canUserReview(userId, productId);
      const hasReviewed = await Review.hasUserReviewed(userId, productId);

      res.status(200).json({
        success: true,
        data: {
          can_review: canReview && !hasReviewed,
          has_reviewed: hasReviewed,
          has_purchased: canReview
        }
      });

    } catch (error) {
      console.error('Check can review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check review eligibility'
      });
    }
  }
}

module.exports = new ReviewController();
