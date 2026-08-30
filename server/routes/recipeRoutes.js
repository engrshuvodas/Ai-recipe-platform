const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');

// @route   GET /api/recipes
// @desc    Get all recipes with multi-facet filters & search
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      search,
      category,
      cuisine,
      country,
      state,
      dietary,
      ingredients,
      maxTime,
      difficulty,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Text Search
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { cuisine: searchRegex },
        { country: searchRegex },
        { state: searchRegex },
        { 'ingredients.name': searchRegex },
      ];
    }

    // Category Filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Cuisine Filter
    if (cuisine && cuisine !== 'All') {
      query.cuisine = new RegExp(`^${cuisine.trim()}$`, 'i');
    }

    // Country Filter
    if (country && country !== 'All') {
      query.country = new RegExp(`^${country.trim()}$`, 'i');
    }

    // State Filter
    if (state && state !== 'All') {
      query.state = new RegExp(`^${state.trim()}$`, 'i');
    }

    // Dietary Filter (e.g. Vegetarian, Vegan, Gluten-Free)
    if (dietary) {
      const dietList = dietary.split(',').map((d) => d.trim()).filter(Boolean);
      if (dietList.length > 0) {
        query.dietary = { $all: dietList };
      }
    }

    // Ingredients Filter (user has ingredients)
    if (ingredients) {
      const ingList = ingredients.split(',').map((i) => new RegExp(i.trim(), 'i')).filter(Boolean);
      if (ingList.length > 0) {
        query['ingredients.name'] = { $in: ingList };
      }
    }

    // Max Total Cooking Time
    if (maxTime && !isNaN(maxTime)) {
      const maxTotal = parseInt(maxTime, 10);
      query.$expr = {
        $lte: [{ $add: ['$prepTime', '$cookTime'] }, maxTotal],
      };
    }

    // Difficulty
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'rating') {
      sortOption = { averageRating: -1, ratingCount: -1 };
    } else if (sort === 'popular') {
      sortOption = { 'likes.length': -1, views: -1 };
    } else if (sort === 'time') {
      sortOption = { cookTime: 1, prepTime: 1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Recipe.countDocuments(query);
    const recipes = await Recipe.find(query)
      .populate('author', 'name username avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: recipes.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      recipes,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/recipes/featured
// @desc    Get featured recipes
router.get('/featured', async (req, res, next) => {
  try {
    const featured = await Recipe.find({ isFeatured: true })
      .populate('author', 'name username avatar')
      .limit(8);

    if (featured.length === 0) {
      // Fallback to highest rated if none marked featured
      const topRated = await Recipe.find()
        .populate('author', 'name username avatar')
        .sort({ averageRating: -1, ratingCount: -1 })
        .limit(8);
      return res.json({ success: true, recipes: topRated });
    }

    res.json({ success: true, recipes: featured });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/recipes/regions
// @desc    Get Country and Indian State culinary collections
router.get('/regions', async (req, res, next) => {
  try {
    const countryStats = await Recipe.aggregate([
      { $match: { country: { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 },
          image: { $first: { $arrayElemAt: ['$images', 0] } },
          sampleCuisine: { $first: '$cuisine' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const stateStats = await Recipe.aggregate([
      { $match: { state: { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$state',
          country: { $first: '$country' },
          count: { $sum: 1 },
          image: { $first: { $arrayElemAt: ['$images', 0] } },
          sampleDish: { $first: '$title' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      countries: countryStats,
      states: stateStats,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/recipes/categories
// @desc    Get recipe counts grouped by category
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Recipe.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          image: { $first: { $arrayElemAt: ['$images', 0] } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/recipes/my-recipes
// @desc    Get recipes uploaded by the current user
router.get('/my-recipes', protect, async (req, res, next) => {
  try {
    const recipes = await Recipe.find({ author: req.user._id })
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, recipes });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/recipes/saved
// @desc    Get bookmarked/saved recipes for user
router.get('/saved', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedRecipes',
      populate: { path: 'author', select: 'name username avatar' },
    });

    res.json({
      success: true,
      recipes: user.savedRecipes || [],
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/recipes/:id
// @desc    Get single recipe by ID
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'name username avatar bio location')
      .populate('ratings.user', 'name username avatar');

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Similar recipes in same cuisine or category
    const similarRecipes = await Recipe.find({
      _id: { $ne: recipe._id },
      $or: [{ cuisine: recipe.cuisine }, { category: recipe.category }],
    })
      .select('title images prepTime cookTime averageRating ratingCount category cuisine')
      .limit(4);

    res.json({
      success: true,
      recipe,
      similarRecipes,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/recipes
// @desc    Create a new recipe
router.post('/', protect, async (req, res, next) => {
  try {
    const {
      title,
      description,
      images,
      category,
      cuisine,
      country,
      state,
      prepTime,
      cookTime,
      servings,
      difficulty,
      ingredients,
      instructions,
      dietary,
      nutritionFacts,
      isFeatured,
    } = req.body;

    if (!title || !description || !ingredients || !instructions) {
      return res.status(400).json({ success: false, message: 'Please provide all required recipe fields' });
    }

    const recipe = await Recipe.create({
      title,
      description,
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'],
      author: req.user._id,
      category: category || 'Dinner',
      cuisine: cuisine || 'Indian',
      country: country || 'India',
      state: state || '',
      prepTime: Number(prepTime) || 15,
      cookTime: Number(cookTime) || 30,
      servings: Number(servings) || 4,
      difficulty: difficulty || 'Medium',
      ingredients,
      instructions,
      dietary: dietary || [],
      nutritionFacts: nutritionFacts || { calories: 350, protein: 12, carbs: 45, fat: 14, fiber: 5 },
      isFeatured: isFeatured || false,
    });

    const populated = await Recipe.findById(recipe._id).populate('author', 'name username avatar');

    res.status(201).json({
      success: true,
      recipe: populated,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/recipes/:id
// @desc    Update an existing recipe
router.put('/:id', protect, async (req, res, next) => {
  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Ensure user is author or admin
    if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this recipe' });
    }

    recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('author', 'name username avatar');

    res.json({
      success: true,
      recipe,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/recipes/:id
// @desc    Delete a recipe
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this recipe' });
    }

    await recipe.deleteOne();

    res.json({
      success: true,
      message: 'Recipe removed successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/recipes/:id/like
// @desc    Toggle like on recipe
router.post('/:id/like', protect, async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const userId = req.user._id;
    const isLiked = recipe.likes.some((id) => id.toString() === userId.toString());

    if (isLiked) {
      recipe.likes = recipe.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      recipe.likes.push(userId);
    }

    await recipe.save();

    res.json({
      success: true,
      liked: !isLiked,
      likesCount: recipe.likes.length,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/recipes/:id/bookmark
// @desc    Toggle save/bookmark recipe to user account
router.post('/:id/bookmark', protect, async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const user = await User.findById(req.user._id);
    const isSaved = user.savedRecipes.some((id) => id.toString() === recipe._id.toString());

    if (isSaved) {
      user.savedRecipes = user.savedRecipes.filter((id) => id.toString() !== recipe._id.toString());
    } else {
      user.savedRecipes.push(recipe._id);
    }

    await user.save();

    res.json({
      success: true,
      saved: !isSaved,
      savedRecipes: user.savedRecipes,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/recipes/:id/rate
// @desc    Add or update rating & comment for recipe
router.post('/:id/rate', protect, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const ratingVal = Number(rating);

    if (!ratingVal || ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a valid rating between 1 and 5' });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const existingIndex = recipe.ratings.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingIndex > -1) {
      recipe.ratings[existingIndex].rating = ratingVal;
      if (comment !== undefined) recipe.ratings[existingIndex].comment = comment;
      recipe.ratings[existingIndex].createdAt = new Date();
    } else {
      recipe.ratings.push({
        user: req.user._id,
        rating: ratingVal,
        comment: comment || '',
        createdAt: new Date(),
      });
    }

    // Recalculate average rating
    const totalScore = recipe.ratings.reduce((acc, item) => acc + item.rating, 0);
    recipe.averageRating = Number((totalScore / recipe.ratings.length).toFixed(1));
    recipe.ratingCount = recipe.ratings.length;

    await recipe.save();

    const updatedRecipe = await Recipe.findById(req.params.id)
      .populate('author', 'name username avatar')
      .populate('ratings.user', 'name username avatar');

    res.json({
      success: true,
      ratings: updatedRecipe.ratings,
      averageRating: updatedRecipe.averageRating,
      ratingCount: updatedRecipe.ratingCount,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/recipes/:id/rate/:ratingId
// @desc    Delete a rating/comment
router.delete('/:id/rate/:ratingId', protect, async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const rating = recipe.ratings.id(req.params.ratingId);
    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    if (rating.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this rating' });
    }

    recipe.ratings.pull(req.params.ratingId);

    if (recipe.ratings.length > 0) {
      const totalScore = recipe.ratings.reduce((acc, item) => acc + item.rating, 0);
      recipe.averageRating = Number((totalScore / recipe.ratings.length).toFixed(1));
      recipe.ratingCount = recipe.ratings.length;
    } else {
      recipe.averageRating = 5.0;
      recipe.ratingCount = 0;
    }

    await recipe.save();

    res.json({
      success: true,
      message: 'Rating removed',
      averageRating: recipe.averageRating,
      ratingCount: recipe.ratingCount,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
