const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { protect, optionalAuth } = require('../middleware/auth');

// ─── OpenRouter API Helper ────────────────────────────────────────────────────
const callLLM = async (messages, temperature = 0.8, maxTokens = 2000) => {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openRouterModel = process.env.OPENROUTER_MODEL || 'openai/gpt-4o';
  
  const localKey = process.env.LOCAL_API_KEY || 'ollama';
  const localModel = process.env.LOCAL_MODEL || 'qwen2.5:1.5b';
  const localBase = process.env.LOCAL_LLM_BASE || 'http://localhost:11434/v1';

  let lastError = null;

  // 1st Priority: OpenRouter
  if (openRouterKey && openRouterKey.length > 10 && !openRouterKey.includes('your-key-here')) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'Recipe Companion AI Chef',
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return { content, model: openRouterModel, provider: 'OpenRouter' };
      } else {
        const errBody = await response.text();
        throw new Error(`OpenRouter API error ${response.status}: ${errBody}`);
      }
    } catch (err) {
      console.warn(`[AI] OpenRouter failed: ${err.message}. Trying local AI fallback...`);
      lastError = err;
    }
  }

  // 2nd Priority: Local AI (Ollama)
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (localKey) headers['Authorization'] = `Bearer ${localKey}`;

    const response = await fetch(`${localBase}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: localModel,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return { content, model: localModel, provider: 'Local AI' };
    } else {
      const errBody = await response.text();
      throw new Error(`Local AI error ${response.status}: ${errBody}`);
    }
  } catch (err) {
    console.error(`[AI] Local AI failed: ${err.message}`);
    lastError = err;
  }

  throw new Error(lastError ? lastError.message : 'No AI providers configured or available.');
};

// ─── Offline Fallback (used only if AI API fails) ────────────────────────────
const generateSmartRecipeOffline = ({
  ingredients = [],
  allergies = [],
  dietary = 'Any',
  cuisine = 'Indian',
  mealType = 'Dinner',
  targetCalories = 450,
  prompt = '',
}) => {
  const ingList = Array.isArray(ingredients)
    ? ingredients
    : ingredients.split(',').map((i) => i.trim()).filter(Boolean);
  const allergyList = Array.isArray(allergies)
    ? allergies.map((a) => a.toLowerCase().trim())
    : allergies ? allergies.split(',').map((a) => a.toLowerCase().trim()) : [];

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const baseIngName = ingList[0] || 'Herb-infused Seasonal Medley';
  const secondIngName = ingList[1] || 'Aromatic Spices';

  let title = `Aromatic ${cap(baseIngName)} & ${cap(secondIngName)} ${cap(cuisine)} ${cap(mealType)}`;
  let image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

  const generatedIngredients = [];
  ingList.forEach((ing) => {
    if (!allergyList.some((a) => ing.toLowerCase().includes(a))) {
      generatedIngredients.push({ name: cap(ing), quantity: '1', unit: 'cup', note: 'freshly prepped', category: 'Produce' });
    }
  });

  [
    { name: 'Olive Oil / Ghee', quantity: '1.5', unit: 'tbsp', category: 'Oils & Sauces' },
    { name: 'Garlic (minced)', quantity: '3', unit: 'cloves', category: 'Produce' },
    { name: 'Ground Cumin & Coriander', quantity: '1', unit: 'tsp each', category: 'Pantry & Spices' },
    { name: 'Salt & Black Pepper', quantity: 'to taste', unit: '', category: 'Pantry & Spices' },
    { name: 'Fresh Lemon Juice', quantity: '1', unit: 'tbsp', category: 'Produce' },
  ].forEach((p) => {
    if (!allergyList.some((a) => p.name.toLowerCase().includes(a))) {
      generatedIngredients.push(p);
    }
  });

  return {
    title,
    description: `A wholesome ${cuisine} ${mealType.toLowerCase()} prepared with your pantry ingredients and aromatic spices.`,
    images: [image],
    category: mealType,
    cuisine,
    country: cuisine.toLowerCase().includes('indian') ? 'India' : 'International',
    prepTime: 12,
    cookTime: 18,
    servings: 2,
    difficulty: 'Easy',
    ingredients: generatedIngredients,
    instructions: [
      { stepNumber: 1, title: 'Prep & Temper', text: `Chop ${ingList.slice(0,3).join(', ') || 'vegetables'}. Heat oil in a pan, add garlic and aromatics until fragrant.`, timerMinutes: 2 },
      { stepNumber: 2, title: 'Sauté & Season', text: `Add main ingredients, sauté for 4-5 minutes. Add spices and a splash of water or broth. Stir well.`, timerMinutes: 5 },
      { stepNumber: 3, title: 'Simmer', text: 'Reduce heat, cover and simmer for 8 minutes, stirring once halfway.', timerMinutes: 8 },
      { stepNumber: 4, title: 'Finish & Serve', text: 'Increase heat to reduce liquid. Add lemon juice, adjust salt, and garnish with fresh herbs. Serve warm!', timerMinutes: 1 },
    ],
    dietary: dietary !== 'Any' ? [dietary] : [],
    nutritionFacts: { calories: Number(targetCalories) || 380, protein: 18, carbs: 32, fat: 12, fiber: 7 },
    isAIGenerated: true,
  };
};

// ─── POST /api/ai/generate ────────────────────────────────────────────────────
// @desc  Generate a complete recipe using GPT-4o via OpenRouter
router.post('/generate', optionalAuth, async (req, res, next) => {
  try {
    const {
      ingredients = [],
      allergies = [],
      dietary = 'Any',
      cuisine = 'Indian',
      mealType = 'Dinner',
      targetCalories = 450,
      prompt = '',
    } = req.body;

    const ingList = Array.isArray(ingredients) ? ingredients.join(', ') : ingredients;
    const allergyList = Array.isArray(allergies) ? allergies.join(', ') : allergies;

    let generatedRecipe = null;

    // ── Try OpenRouter GPT-4o ──
    try {
      const systemPrompt = `You are Chef Marco, a world-class Michelin-starred culinary AI at Recipe Companion. 
Your task is to generate a complete, authentic, and delicious recipe based on the user's pantry and preferences.
Always respond with ONLY valid JSON. No markdown. No extra text. Just pure JSON.`;

      const userPrompt = `Create a complete recipe with these details:
- Available Ingredients: ${ingList || 'general pantry staples'}
- EXCLUDE (Allergies / Avoid): ${allergyList || 'none'}
- Dietary Preference: ${dietary}
- Cuisine Style: ${cuisine}
- Meal Type: ${mealType}
- Target Calories per serving: ${targetCalories} kcal
- Special Request: ${prompt || 'make it delicious and authentic'}

Respond ONLY with this exact JSON structure (no markdown, no extra text):
{
  "title": "Descriptive Recipe Name",
  "description": "Appetizing 2-3 sentence description of the dish",
  "category": "${mealType}",
  "cuisine": "${cuisine}",
  "country": "Country of origin",
  "prepTime": 15,
  "cookTime": 25,
  "servings": 2,
  "difficulty": "Easy",
  "ingredients": [
    { "name": "Ingredient", "quantity": "1", "unit": "cup", "note": "prep note", "category": "Produce" }
  ],
  "instructions": [
    { "stepNumber": 1, "title": "Step Title", "text": "Detailed step description with technique tips", "timerMinutes": 5 }
  ],
  "dietary": ["Vegetarian"],
  "nutritionFacts": { "calories": 400, "protein": 20, "carbs": 40, "fat": 15, "fiber": 6 },
  "chefTip": "A professional tip to make this dish restaurant-quality"
}`;

      const result = await callLLM([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

      // Strip any accidental markdown code blocks
      const cleaned = result.content.replace(/```json/gi, '').replace(/```/gi, '').trim();
      generatedRecipe = JSON.parse(cleaned);
      generatedRecipe.isAIGenerated = true;
      generatedRecipe.aiModel = result.model;
      generatedRecipe.images = [
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      ];
      console.log(`[AI] Recipe generated via ${result.provider} (${result.model}):`, generatedRecipe.title);
    } catch (aiErr) {
      console.error('[AI] AI generation failed — falling back to offline engine:', aiErr.message);
    }

    // ── Fallback to local offline engine ──
    if (!generatedRecipe) {
      generatedRecipe = generateSmartRecipeOffline({ ingredients, allergies, dietary, cuisine, mealType, targetCalories, prompt });
    }

    res.json({ success: true, recipe: generatedRecipe });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/ai/chef-chat ───────────────────────────────────────────────────
// @desc  Chef AI chat powered by GPT-4o for cooking tips, substitutes, pairings
router.post('/chef-chat', optionalAuth, async (req, res, next) => {
  try {
    const { question, currentRecipe } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a culinary question' });
    }

    let answer = '';

    // ── Try OpenRouter GPT-4o ──
    try {
      const recipeContext = currentRecipe
        ? `The user is currently viewing the recipe: "${currentRecipe.title}" with ingredients: ${
            currentRecipe.ingredients?.map((i) => i.name).join(', ')
          }.`
        : '';

      const messages = [
        {
          role: 'system',
          content: `You are Chef Marco, an expert culinary AI assistant at Recipe Companion. 
You specialize in Indian and global cuisines, ingredient substitutions, cooking techniques, spice pairings, and meal planning. 
${recipeContext}
Always give practical, friendly, concise answers (2-4 sentences max). Use emojis sparingly for warmth.`,
        },
        {
          role: 'user',
          content: question,
        },
      ];

      const result = await callLLM(messages, 0.7, 400);
      answer = result.content;
      console.log(`[AI] Chef chat answered via ${result.provider}`);
    } catch (aiErr) {
      console.error('[AI] Chef chat failed — using local fallback:', aiErr.message);

      // Local keyword-based fallback
      const q = question.toLowerCase();
      if (q.includes('substitute') || q.includes('replace') || q.includes('instead of')) {
        if (q.includes('egg')) {
          answer = '🥚 Replace 1 egg with: 1/4 cup applesauce, 1 mashed banana, or 1 tbsp flaxseed + 3 tbsp water (flax egg). Works great in baking!';
        } else if (q.includes('butter')) {
          answer = '🧈 Substitute butter 1:1 with olive oil for savory cooking, or coconut oil for baking.';
        } else if (q.includes('milk') || q.includes('dairy')) {
          answer = '🥛 Use oat milk (creamy), almond milk (light), or full-fat coconut milk (rich curries) as dairy alternatives.';
        } else {
          answer = '👨‍🍳 Find an ingredient with similar fat or moisture content. Taste and adjust as you go!';
        }
      } else if (q.includes('too salty') || q.includes('fix salt')) {
        answer = '🧂 Add a raw potato wedge and simmer 10 min to absorb salt, or balance with lemon juice and a splash of coconut milk.';
      } else if (q.includes('pairing') || q.includes('serve with')) {
        answer = '🍷 Rich curries pair well with jeera rice or naan. Light salads go great with citrusy sparkling water or a crisp white wine.';
      } else {
        answer = '👨‍🍳 Chef Tip: Pre-heat your pan before adding oil, temper whole spices over medium heat to release aromatics, and always taste before serving!';
      }
    }

    res.json({ success: true, answer });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/ai/meal-suggestions ───────────────────────────────────────────
// @desc  Get AI-powered weekly meal suggestions based on preferences
router.post('/meal-suggestions', optionalAuth, async (req, res, next) => {
  try {
    const { dietary = 'Any', cuisine = 'Indian', targetCalories = 450 } = req.body;

    let suggestions = [];

    try {
      const result = await callLLM([
        {
          role: 'system',
          content: 'You are a professional nutritionist and chef. Respond ONLY with valid JSON. No markdown.',
        },
        {
          role: 'user',
          content: `Suggest 7 healthy ${dietary !== 'Any' ? dietary : ''} ${cuisine} meal ideas (one per day of the week).
Target: ~${targetCalories} calories per meal.
Respond ONLY with this JSON array:
[
  { "day": "Monday", "meal": "Meal Name", "description": "1-sentence description", "calories": 420, "prepTime": 20 },
  ...7 items
]`,
        },
      ], 0.7, 800);

      const cleaned = result.content.replace(/```json/gi, '').replace(/```/gi, '').trim();
      suggestions = JSON.parse(cleaned);
      console.log(`[AI] Meal suggestions generated via ${result.provider}`);
    } catch (aiErr) {
      console.error('[AI] Meal suggestions fallback:', aiErr.message);
      suggestions = [
        { day: 'Monday', meal: 'Masala Oats Upma', description: 'Light, protein-packed Indian breakfast.', calories: 320, prepTime: 15 },
        { day: 'Tuesday', meal: 'Palak Paneer with Roti', description: 'Creamy spinach and cottage cheese curry.', calories: 450, prepTime: 25 },
        { day: 'Wednesday', meal: 'Lemon Coriander Soup', description: 'Tangy, immunity-boosting clear soup.', calories: 180, prepTime: 20 },
        { day: 'Thursday', meal: 'Rajma Chawal Bowl', description: 'Hearty kidney bean curry with jeera rice.', calories: 510, prepTime: 30 },
        { day: 'Friday', meal: 'Moong Dal Cheela', description: 'Crispy savory lentil crepes with chutney.', calories: 280, prepTime: 20 },
        { day: 'Saturday', meal: 'Veg Biryani', description: 'Fragrant basmati rice with mixed vegetables.', calories: 480, prepTime: 35 },
        { day: 'Sunday', meal: 'Dal Tadka with Jeera Rice', description: 'Comfort food with tempered lentils.', calories: 420, prepTime: 25 },
      ];
    }

    res.json({ success: true, suggestions });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
