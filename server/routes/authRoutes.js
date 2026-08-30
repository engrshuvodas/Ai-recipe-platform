const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_recipe_companion_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res, next) => {
  try {
    const { name, username, email, password, avatar, bio, dietaryPreferences, allergies } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const usernameExists = await User.findOne({ username: username.toLowerCase() });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: bio || 'Food enthusiast exploring flavors from around the world.',
      dietaryPreferences: dietaryPreferences || [],
      allergies: allergies || [],
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        dietaryPreferences: user.dietaryPreferences,
        allergies: user.allergies,
        favoriteCuisines: user.favoriteCuisines,
        savedRecipes: user.savedRecipes,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/username and password' });
    }

    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        dietaryPreferences: user.dietaryPreferences,
        allergies: user.allergies,
        favoriteCuisines: user.favoriteCuisines,
        savedRecipes: user.savedRecipes,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedRecipes', 'title images cuisine prepTime cookTime averageRating ratingCount category');
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/profile
// @desc    Update current user profile
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, bio, avatar, location, dietaryPreferences, allergies, favoriteCuisines } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (location !== undefined) user.location = location;
    if (dietaryPreferences) user.dietaryPreferences = dietaryPreferences;
    if (allergies) user.allergies = allergies;
    if (favoriteCuisines) user.favoriteCuisines = favoriteCuisines;

    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        dietaryPreferences: user.dietaryPreferences,
        allergies: user.allergies,
        favoriteCuisines: user.favoriteCuisines,
        savedRecipes: user.savedRecipes,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/users
// @desc    Get users for search/chat directory
router.get('/users', protect, async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const query = {
      _id: { $ne: req.user._id },
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('name username avatar bio location')
      .limit(30);

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/user/:id
// @desc    Get public profile of another user
router.get('/user/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name username avatar bio location createdAt');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const recipes = await Recipe.find({ author: user._id })
      .select('title description images cuisine category prepTime cookTime averageRating ratingCount likes createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      user,
      recipes,
      recipeCount: recipes.length,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
