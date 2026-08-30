const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
  },
  customTitle: {
    type: String,
    default: '',
  },
  calories: {
    type: Number,
    default: 0,
  },
  servings: {
    type: Number,
    default: 1,
  },
  notes: {
    type: String,
    default: '',
  },
});

const dayPlanSchema = new mongoose.Schema({
  date: {
    type: String, // format YYYY-MM-DD
    required: true,
  },
  dayOfWeek: {
    type: String,
    required: true,
  },
  breakfast: [mealItemSchema],
  lunch: [mealItemSchema],
  dinner: [mealItemSchema],
  snacks: [mealItemSchema],
});

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planType: {
      type: String,
      enum: ['weekly', 'monthly'],
      default: 'weekly',
    },
    title: {
      type: String,
      default: 'My Healthy Meal Plan',
    },
    startDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    endDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    days: [dayPlanSchema],
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

mealPlanSchema.index({ user: 1, startDate: 1 });

module.exports = mongoose.model('MealPlan', mealPlanSchema);
