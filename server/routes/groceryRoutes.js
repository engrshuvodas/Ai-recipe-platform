const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { optionalAuth } = require('../middleware/auth');

const generateStores = (query) => {
  const encoded = encodeURIComponent(query.trim());
  return [
    {
      name: 'Blinkit',
      logo: '⚡',
      badge: '10 Mins Delivery',
      url: `https://blinkit.com/s/?q=${encoded}`,
      color: '#f7c942',
      textColor: '#1f2937',
    },
    {
      name: 'Zepto',
      logo: '🚀',
      badge: 'Superfast Groceries',
      url: `https://www.zepto.com/search?query=${encoded}`,
      color: '#800080',
      textColor: '#ffffff',
    },
    {
      name: 'BigBasket',
      logo: '🧺',
      badge: 'Fresh & Organic',
      url: `https://www.bigbasket.com/ps/?q=${encoded}`,
      color: '#84c225',
      textColor: '#ffffff',
    },
    {
      name: 'Instamart',
      logo: '🛍️',
      badge: 'Instant Mart',
      url: `https://www.swiggy.com/instamart/search?query=${encoded}`,
      color: '#fc8019',
      textColor: '#ffffff',
    },
    {
      name: 'Amazon Fresh',
      logo: '📦',
      badge: 'Scheduled Delivery',
      url: `https://www.amazon.in/s?k=${encoded}&i=now-store`,
      color: '#232f3e',
      textColor: '#ffffff',
    },
  ];
};

// @route   POST /api/grocery/generate-links
// @desc    Generate purchase links for ingredients list or recipe
router.post('/generate-links', optionalAuth, async (req, res, next) => {
  try {
    const { recipeId, ingredients = [] } = req.body;

    let items = [];

    if (recipeId) {
      const recipe = await Recipe.findById(recipeId);
      if (recipe) {
        items = recipe.ingredients.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          category: ing.category,
          stores: generateStores(ing.name),
        }));
      }
    } else if (Array.isArray(ingredients) && ingredients.length > 0) {
      items = ingredients.map((ing) => {
        const name = typeof ing === 'string' ? ing : ing.name;
        return {
          name,
          quantity: ing.quantity || '1',
          unit: ing.unit || '',
          category: ing.category || 'Pantry & Spices',
          stores: generateStores(name),
        };
      });
    }

    // Consolidated bundle query
    const bundleQuery = items.slice(0, 4).map((i) => i.name).join(' ');
    const bundleStores = generateStores(bundleQuery || 'Groceries');

    res.json({
      success: true,
      totalItems: items.length,
      items,
      bundleStores,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
