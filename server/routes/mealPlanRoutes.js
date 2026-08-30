const express = require('express');
const router = express.Router();
const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');
const { protect } = require('../middleware/auth');

// Helper to generate grocery search links
const generateGroceryLinks = (itemName) => {
  const encoded = encodeURIComponent(itemName);
  return {
    blinkit: `https://blinkit.com/s/?q=${encoded}`,
    zepto: `https://www.zepto.com/search?query=${encoded}`,
    bigbasket: `https://www.bigbasket.com/ps/?q=${encoded}`,
    instamart: `https://www.swiggy.com/instamart/search?query=${encoded}`,
    amazonFresh: `https://www.amazon.in/s?k=${encoded}&i=now-store`,
  };
};

// @route   GET /api/meal-plans
// @desc    Get all meal plans for user
router.get('/', protect, async (req, res, next) => {
  try {
    const plans = await MealPlan.find({ user: req.user._id })
      .populate('days.breakfast.recipe', 'title images cuisine prepTime cookTime category')
      .populate('days.lunch.recipe', 'title images cuisine prepTime cookTime category')
      .populate('days.dinner.recipe', 'title images cuisine prepTime cookTime category')
      .populate('days.snacks.recipe', 'title images cuisine prepTime cookTime category')
      .sort({ startDate: -1 });

    res.json({ success: true, plans });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/meal-plans/active
// @desc    Get active meal plan by type & date
router.get('/active', protect, async (req, res, next) => {
  try {
    const { planType = 'weekly', startDate } = req.query;

    const query = { user: req.user._id, planType };
    if (startDate) {
      query.startDate = startDate;
    }

    let plan = await MealPlan.findOne(query)
      .populate('days.breakfast.recipe', 'title images cuisine prepTime cookTime category ingredients')
      .populate('days.lunch.recipe', 'title images cuisine prepTime cookTime category ingredients')
      .populate('days.dinner.recipe', 'title images cuisine prepTime cookTime category ingredients')
      .populate('days.snacks.recipe', 'title images cuisine prepTime cookTime category ingredients');

    res.json({ success: true, plan });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/meal-plans
// @desc    Create or update weekly/monthly meal plan
router.post('/', protect, async (req, res, next) => {
  try {
    const { planType, title, startDate, endDate, days, notes } = req.body;

    if (!startDate || !endDate || !days) {
      return res.status(400).json({ success: false, message: 'Please provide start date, end date, and days' });
    }

    let plan = await MealPlan.findOne({
      user: req.user._id,
      planType: planType || 'weekly',
      startDate,
    });

    if (plan) {
      plan.title = title || plan.title;
      plan.endDate = endDate;
      plan.days = days;
      plan.notes = notes || '';
      await plan.save();
    } else {
      plan = await MealPlan.create({
        user: req.user._id,
        planType: planType || 'weekly',
        title: title || `${planType === 'monthly' ? 'Monthly' : 'Weekly'} Meal Plan (${startDate})`,
        startDate,
        endDate,
        days,
        notes: notes || '',
      });
    }

    const populated = await MealPlan.findById(plan._id)
      .populate('days.breakfast.recipe', 'title images cuisine prepTime cookTime category')
      .populate('days.lunch.recipe', 'title images cuisine prepTime cookTime category')
      .populate('days.dinner.recipe', 'title images cuisine prepTime cookTime category')
      .populate('days.snacks.recipe', 'title images cuisine prepTime cookTime category');

    res.status(200).json({ success: true, plan: populated });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/meal-plans/add-meal
// @desc    Add a recipe or custom meal to a specific slot
router.post('/add-meal', protect, async (req, res, next) => {
  try {
    const { planType = 'weekly', startDate, endDate, date, dayOfWeek, slot, recipeId, customTitle, notes } = req.body;

    if (!date || !slot) {
      return res.status(400).json({ success: false, message: 'Date and slot (breakfast, lunch, dinner, snacks) are required' });
    }

    let plan = await MealPlan.findOne({ user: req.user._id, planType, startDate });

    if (!plan) {
      // Create fresh plan with the day
      plan = new MealPlan({
        user: req.user._id,
        planType,
        startDate: startDate || date,
        endDate: endDate || date,
        days: [
          {
            date,
            dayOfWeek: dayOfWeek || new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: [],
          },
        ],
      });
    }

    let day = plan.days.find((d) => d.date === date);
    if (!day) {
      day = {
        date,
        dayOfWeek: dayOfWeek || new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
      };
      plan.days.push(day);
    }

    const mealItem = {
      recipe: recipeId || null,
      customTitle: customTitle || '',
      notes: notes || '',
    };

    if (slot === 'breakfast') day.breakfast.push(mealItem);
    else if (slot === 'lunch') day.lunch.push(mealItem);
    else if (slot === 'dinner') day.dinner.push(mealItem);
    else if (slot === 'snacks') day.snacks.push(mealItem);

    await plan.save();

    const populated = await MealPlan.findById(plan._id)
      .populate('days.breakfast.recipe', 'title images cuisine prepTime cookTime category')
      .populate('days.lunch.recipe', 'title images cuisine prepTime cookTime category')
      .populate('days.dinner.recipe', 'title images cuisine prepTime cookTime category')
      .populate('days.snacks.recipe', 'title images cuisine prepTime cookTime category');

    res.json({ success: true, plan: populated });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/meal-plans/remove-meal
// @desc    Remove a meal from a specific slot
router.post('/remove-meal', protect, async (req, res, next) => {
  try {
    const { planId, date, slot, mealItemId } = req.body;

    const plan = await MealPlan.findOne({ _id: planId, user: req.user._id });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Meal plan not found' });
    }

    const day = plan.days.find((d) => d.date === date);
    if (day && day[slot]) {
      day[slot] = day[slot].filter((m) => m._id.toString() !== mealItemId);
      await plan.save();
    }

    const populated = await MealPlan.findById(plan._id)
      .populate('days.breakfast.recipe', 'title images cuisine prepTime cookTime category')
      .populate('days.lunch.recipe', 'title images cuisine prepTime cookTime category')
      .populate('days.dinner.recipe', 'title images cuisine prepTime cookTime category')
      .populate('days.snacks.recipe', 'title images cuisine prepTime cookTime category');

    res.json({ success: true, plan: populated });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/meal-plans/:id/shopping-list
// @desc    Generate consolidated categorized grocery shopping list from meal plan
router.get('/:id/shopping-list', protect, async (req, res, next) => {
  try {
    const plan = await MealPlan.findOne({ _id: req.params.id, user: req.user._id })
      .populate('days.breakfast.recipe')
      .populate('days.lunch.recipe')
      .populate('days.dinner.recipe')
      .populate('days.snacks.recipe');

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Meal plan not found' });
    }

    const itemMap = new Map();

    const collectIngredients = (recipe) => {
      if (!recipe || !recipe.ingredients) return;
      recipe.ingredients.forEach((ing) => {
        const key = ing.name.toLowerCase().trim();
        if (!itemMap.has(key)) {
          itemMap.set(key, {
            name: ing.name.trim(),
            category: ing.category || 'Pantry & Spices',
            quantities: [`${ing.quantity} ${ing.unit}`.trim()],
            recipes: [recipe.title],
            links: generateGroceryLinks(ing.name),
          });
        } else {
          const item = itemMap.get(key);
          item.quantities.push(`${ing.quantity} ${ing.unit}`.trim());
          if (!item.recipes.includes(recipe.title)) {
            item.recipes.push(recipe.title);
          }
        }
      });
    };

    plan.days.forEach((day) => {
      ['breakfast', 'lunch', 'dinner', 'snacks'].forEach((slot) => {
        if (day[slot]) {
          day[slot].forEach((m) => {
            if (m.recipe) collectIngredients(m.recipe);
          });
        }
      });
    });

    const items = Array.from(itemMap.values());
    const categorized = {};

    items.forEach((item) => {
      if (!categorized[item.category]) {
        categorized[item.category] = [];
      }
      categorized[item.category].push({
        ...item,
        combinedQuantity: item.quantities.join(' + '),
      });
    });

    res.json({
      success: true,
      totalItems: items.length,
      categories: categorized,
      items,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
