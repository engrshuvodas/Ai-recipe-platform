const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    default: '',
    trim: true,
  },
  note: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry & Spices', 'Bakery', 'Grains & Pasta', 'Oils & Sauces', 'Other'],
    default: 'Other',
  },
});

const instructionSchema = new mongoose.Schema({
  stepNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    required: true,
  },
  timerMinutes: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    default: '',
  },
});

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a recipe title'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Please add a recipe description'],
      maxlength: 1000,
    },
    images: {
      type: [String],
      default: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Breakfast',
        'Lunch',
        'Dinner',
        'Dessert',
        'Snack',
        'Beverage',
        'Bakery',
        'Soup',
        'Salad',
        'Appetizer',
        'Side Dish',
      ],
      default: 'Dinner',
    },
    cuisine: {
      type: String,
      required: true,
      trim: true,
      default: 'Indian',
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'India',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    prepTime: {
      type: Number, // in minutes
      required: true,
      default: 15,
    },
    cookTime: {
      type: Number, // in minutes
      required: true,
      default: 30,
    },
    servings: {
      type: Number,
      required: true,
      default: 4,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    ingredients: {
      type: [ingredientSchema],
      required: true,
      validate: [v => Array.isArray(v) && v.length > 0, 'At least one ingredient is required'],
    },
    instructions: {
      type: [instructionSchema],
      required: true,
      validate: [v => Array.isArray(v) && v.length > 0, 'At least one instruction step is required'],
    },
    dietary: {
      type: [String],
      default: [],
    },
    nutritionFacts: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 }, // grams
      carbs: { type: Number, default: 0 }, // grams
      fat: { type: Number, default: 0 }, // grams
      fiber: { type: Number, default: 0 }, // grams
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    ratings: [ratingSchema],
    averageRating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

recipeSchema.index({ title: 'text', description: 'text', cuisine: 'text', country: 'text', state: 'text', 'ingredients.name': 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
