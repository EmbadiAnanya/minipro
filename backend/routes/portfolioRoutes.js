const express = require('express');
const { 
  getMyPortfolios, 
  savePortfolio, 
  getPublicPortfolio, 
  getAllPortfolios, 
  moderatePortfolio,
  getExplorePortfolios
} = require('../controllers/portfolioController');
const { protect, admin, optionalProtect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, savePortfolio);

router.get('/my', protect, getMyPortfolios);
router.get('/me', protect, getMyPortfolios); // Backward compatibility

router.get('/explore', getExplorePortfolios);
router.get('/public/:publicUrl', optionalProtect, getPublicPortfolio);

// Admin Routes
router.get('/admin/all', protect, admin, getAllPortfolios);
router.put('/admin/moderate/:id', protect, admin, moderatePortfolio);

module.exports = router;
