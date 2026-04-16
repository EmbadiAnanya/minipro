const Portfolio = require('../models/Portfolio');
const Analytics = require('../models/Analytics');
const User = require('../models/User');

// @desc    Get all portfolios for the logged-in user
// @route   GET /api/portfolios/my
// @access  Private
const getMyPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user._id });
    res.json(portfolios);
  } catch (error) {
    console.error('Error in getMyPortfolios:', error);
    res.status(500).json({ message: 'Database selection error. Check your Atlas IP Whitelist.', error: error.message });
  }
};

// @desc    Create or update user's portfolio
// @route   POST /api/portfolios
// @access  Private
const savePortfolio = async (req, res) => {
  try {
    const { template, theme, branding, socials, sections, status, publicUrl } = req.body;

    // Handle empty publicUrl to avoid unique constraint issues with empty strings
    const finalPublicUrl = publicUrl && publicUrl.trim() !== '' ? publicUrl.trim() : undefined;

    // Check if publicUrl is already taken by another user
    if (finalPublicUrl) {
      const existing = await Portfolio.findOne({ 
        publicUrl: finalPublicUrl, 
        user: { $ne: req.user._id } 
      });
      if (existing) {
        return res.status(400).json({ message: 'Public URL is already taken' });
      }
    }

    let portfolio = await Portfolio.findOne({ user: req.user._id });

    if (portfolio) {
      portfolio.template = template || portfolio.template;
      portfolio.theme = theme || portfolio.theme;
      portfolio.branding = branding || portfolio.branding;
      portfolio.socials = socials || portfolio.socials;
      portfolio.sections = sections || portfolio.sections;
      portfolio.status = status || portfolio.status;
      portfolio.publicUrl = finalPublicUrl;

      const updatedPortfolio = await portfolio.save();
      res.json(updatedPortfolio);
    } else {
      const newPortfolio = await Portfolio.create({
        user: req.user._id,
        template,
        theme,
        branding,
        socials,
        sections,
        status: status || 'draft',
        publicUrl: finalPublicUrl
      });
      res.status(201).json(newPortfolio);
    }
  } catch (error) {
    console.error('Error in savePortfolio:', error);
    res.status(500).json({ message: 'Server Error during save. Check database connection.', error: error.message });
  }
};

// @desc    Get public portfolio by publicUrl
// @route   GET /api/portfolios/public/:publicUrl
// @access  Public (Optional Auth)
const getPublicPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ 
      publicUrl: req.params.publicUrl
    }).populate('user', 'name email profileImage');

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Check permissions
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && req.user._id && portfolio.user._id && req.user._id.toString() === portfolio.user._id.toString();
    const isApproved = portfolio.status === 'approved';

    if (isApproved || isAdmin || isOwner) {
      // Record view only for public approved views (not admin or owner)
      if (isApproved && !isAdmin && !isOwner) {
        portfolio.views += 1;
        await portfolio.save();

        try {
          await Analytics.create({
            portfolio: portfolio._id,
            ip: req.ip,
            userAgent: req.headers['user-agent']
          });
        } catch (analyticsError) {
          console.error('Failed to record analytics:', analyticsError);
        }
      }

      return res.json(portfolio);
    } else {
      // Forbidden access for unapproved portfolios to non-admins/non-owners
      return res.status(403).json({ message: 'Portfolio is pending approval and not publicly accessible' });
    }
  } catch (error) {
    console.error('Error in getPublicPortfolio:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Admin: Get all portfolios for moderation
// @route   GET /api/portfolios/admin/all
// @access  Private/Admin
const getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({}).populate('user', 'name email');
    res.json(portfolios);
  } catch (error) {
    console.error('Error in getAllPortfolios:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Admin: Moderate portfolio (approve/reject)
// @route   PUT /api/portfolios/admin/moderate/:id
// @access  Private/Admin
const moderatePortfolio = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const portfolio = await Portfolio.findById(req.params.id);

    if (portfolio) {
      portfolio.status = status;
      portfolio.feedback = feedback || '';
      
      const updatedPortfolio = await portfolio.save();
      res.json(updatedPortfolio);
    } else {
      res.status(404).json({ message: 'Portfolio not found' });
    }
  } catch (error) {
    console.error('Error in moderatePortfolio:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all approved portfolios for Explore section
// @route   GET /api/portfolios/explore
// @access  Public
const getExplorePortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ status: 'approved' })
      .populate('user', 'name profileImage')
      .select('publicUrl template theme views user');
    res.json(portfolios);
  } catch (error) {
    console.error('Error in getExplorePortfolios:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getMyPortfolios,
  savePortfolio,
  getPublicPortfolio,
  getAllPortfolios,
  moderatePortfolio,
  getExplorePortfolios
};
