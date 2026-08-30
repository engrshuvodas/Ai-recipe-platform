import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recipeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Clock,
  Sparkles,
  ArrowLeft,
  UtensilsCrossed,
  Save,
} from 'lucide-react';

const RecipeForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80');
  const [category, setCategory] = useState('Dinner');
  const [cuisine, setCuisine] = useState('Indian');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Punjab');
  const [prepTime, setPrepTime] = useState(20);
  const [cookTime, setCookTime] = useState(25);
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState('Medium');
  const [dietaryTags, setDietaryTags] = useState(['Vegetarian']);

  const [ingredients, setIngredients] = useState([
    { name: '', quantity: '1', unit: 'cup', note: '', category: 'Produce' },
    { name: '', quantity: '2', unit: 'tbsp', note: '', category: 'Pantry & Spices' },
  ]);

  const [instructions, setInstructions] = useState([
    { stepNumber: 1, title: 'Prep Aromatics', text: '', timerMinutes: 2 },
    { stepNumber: 2, title: 'Simmer & Season', text: '', timerMinutes: 10 },
  ]);

  const [nutrition, setNutrition] = useState({
    calories: 400,
    protein: 15,
    carbs: 45,
    fat: 14,
    fiber: 5,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please sign in to upload recipes');
      navigate('/login');
      return;
    }

    if (isEditMode) {
      loadRecipeToEdit();
    }
  }, [id, isAuthenticated]);

  const loadRecipeToEdit = async () => {
    try {
      setLoading(true);
      const res = await recipeAPI.getById(id);
      const r = res.data.recipe;
      setTitle(r.title);
      setDescription(r.description);
      setImageUrl(r.images?.[0] || '');
      setCategory(r.category);
      setCuisine(r.cuisine);
      setCountry(r.country);
      setState(r.state || '');
      setPrepTime(r.prepTime);
      setCookTime(r.cookTime);
      setServings(r.servings);
      setDifficulty(r.difficulty);
      setDietaryTags(r.dietary || []);
      if (r.ingredients?.length) setIngredients(r.ingredients);
      if (r.instructions?.length) setInstructions(r.instructions);
      if (r.nutritionFacts) setNutrition(r.nutritionFacts);
    } catch (err) {
      toast.error('Failed to load recipe for editing');
      navigate('/explore');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: '', quantity: '1', unit: '', note: '', category: 'Produce' },
    ]);
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const handleAddInstruction = () => {
    setInstructions([
      ...instructions,
      { stepNumber: instructions.length + 1, title: '', text: '', timerMinutes: 5 },
    ]);
  };

  const handleRemoveInstruction = (index) => {
    const filtered = instructions.filter((_, i) => i !== index);
    const reindexed = filtered.map((step, i) => ({ ...step, stepNumber: i + 1 }));
    setInstructions(reindexed);
  };

  const handleInstructionChange = (index, field, value) => {
    const updated = [...instructions];
    updated[index][field] = value;
    setInstructions(updated);
  };

  const toggleDietTag = (tag) => {
    setDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please enter recipe title and description');
      return;
    }

    const validIngredients = ingredients.filter((ing) => ing.name.trim());
    if (validIngredients.length === 0) {
      toast.error('Please enter at least one ingredient');
      return;
    }

    const validInstructions = instructions.filter((inst) => inst.text.trim());
    if (validInstructions.length === 0) {
      toast.error('Please enter at least one instruction step');
      return;
    }

    setSubmitting(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      images: [imageUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'],
      category,
      cuisine,
      country,
      state,
      prepTime: Number(prepTime),
      cookTime: Number(cookTime),
      servings: Number(servings),
      difficulty,
      dietary: dietaryTags,
      ingredients: validIngredients,
      instructions: validInstructions,
      nutritionFacts: nutrition,
    };

    try {
      if (isEditMode) {
        await recipeAPI.update(id, payload);
        toast.success('Recipe updated successfully!');
        navigate(`/recipe/${id}`);
      } else {
        const res = await recipeAPI.create(payload);
        toast.success('Recipe created and published!');
        navigate(`/recipe/${res.data.recipe._id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save recipe');
    } finally {
      setSubmitting(false);
    }
  };

  const allDiets = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'High-Protein', 'Nut-Free', 'Low-Calorie'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 dark:hover:text-cream-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 dark:text-cream-50">
          {isEditMode ? 'Edit Recipe' : 'Upload New Gourmet Recipe'}
        </h1>
        <div className="w-12" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0e271f] border border-stone-200 dark:border-forest-800 shadow-soft space-y-5">
          <h2 className="font-serif font-bold text-lg text-forest-900 dark:text-cream-50 pb-2 border-b border-stone-100 dark:border-forest-900">
            1. General Recipe Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Recipe Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Mughlai Paneer Tikka Masala"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-xs sm:text-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Appetizing Description *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe flavor notes, aroma, textures, and backstory..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-xs focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-xs focus:outline-none focus:border-gold-500"
              />
            </div>

            {/* Grid Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-forest-950 border border-stone-200 dark:border-forest-800 text-xs"
                >
                  {['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Bakery', 'Soup', 'Salad'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Cuisine</label>
                <input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-forest-950 border border-stone-200 dark:border-forest-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-forest-950 border border-stone-200 dark:border-forest-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Indian State</label>
                <input
                  type="text"
                  placeholder="e.g. Punjab, Kerala"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-forest-950 border border-stone-200 dark:border-forest-800 text-xs"
                />
              </div>
            </div>

            {/* Numeric Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Prep Time (mins)</label>
                <input
                  type="number"
                  min="1"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-forest-950 border border-stone-200 dark:border-forest-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Cook Time (mins)</label>
                <input
                  type="number"
                  min="1"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-forest-950 border border-stone-200 dark:border-forest-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Servings</label>
                <input
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-forest-950 border border-stone-200 dark:border-forest-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-forest-950 border border-stone-200 dark:border-forest-800 text-xs"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Dietary Tags */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">Dietary Badges</label>
              <div className="flex flex-wrap gap-2">
                {allDiets.map((tag) => {
                  const isChecked = dietaryTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleDietTag(tag)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                        isChecked
                          ? 'bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 border-transparent'
                          : 'bg-stone-50 dark:bg-forest-950 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-forest-800'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Ingredients Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0e271f] border border-stone-200 dark:border-forest-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-forest-900">
            <h2 className="font-serif font-bold text-lg text-forest-900 dark:text-cream-50">
              2. Ingredients & Grocery Categories
            </h2>
            <button
              type="button"
              onClick={handleAddIngredient}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gold-500 text-forest-950 font-bold text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Ingredient</span>
            </button>
          </div>

          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 p-3 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800">
                <input
                  type="text"
                  required
                  placeholder="Ingredient Name (e.g. Paneer)"
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-forest-900 text-xs border border-stone-200 dark:border-forest-800 focus:outline-none focus:border-gold-500"
                />
                <input
                  type="text"
                  placeholder="Qty (e.g. 200)"
                  value={ing.quantity}
                  onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                  className="w-24 px-3 py-2 rounded-xl bg-white dark:bg-forest-900 text-xs border border-stone-200 dark:border-forest-800"
                />
                <input
                  type="text"
                  placeholder="Unit (e.g. g, cup)"
                  value={ing.unit}
                  onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                  className="w-24 px-3 py-2 rounded-xl bg-white dark:bg-forest-900 text-xs border border-stone-200 dark:border-forest-800"
                />
                <select
                  value={ing.category}
                  onChange={(e) => handleIngredientChange(idx, 'category', e.target.value)}
                  className="px-2 py-2 rounded-xl bg-white dark:bg-forest-900 text-xs border border-stone-200 dark:border-forest-800"
                >
                  {['Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry & Spices', 'Bakery', 'Grains & Pasta', 'Oils & Sauces', 'Other'].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Instructions Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0e271f] border border-stone-200 dark:border-forest-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-forest-900">
            <h2 className="font-serif font-bold text-lg text-forest-900 dark:text-cream-50">
              3. Cooking Instructions & Timers
            </h2>
            <button
              type="button"
              onClick={handleAddInstruction}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gold-500 text-forest-950 font-bold text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Step</span>
            </button>
          </div>

          <div className="space-y-4">
            {instructions.map((inst, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gold-600 dark:text-gold-400">
                    Step {inst.stepNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Timer (mins):</span>
                      <input
                        type="number"
                        min="0"
                        value={inst.timerMinutes}
                        onChange={(e) => handleInstructionChange(idx, 'timerMinutes', Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-forest-900 border text-xs"
                      />
                    </div>
                    {instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveInstruction(idx)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Step Subtitle (e.g. Sautéing Onions and Spices)"
                  value={inst.title}
                  onChange={(e) => handleInstructionChange(idx, 'title', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-forest-900 text-xs border border-stone-200 dark:border-forest-800"
                />

                <textarea
                  rows={2}
                  required
                  placeholder="Detailed cooking step instruction..."
                  value={inst.text}
                  onChange={(e) => handleInstructionChange(idx, 'text', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-forest-900 text-xs border border-stone-200 dark:border-forest-800"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-2xl bg-stone-200 dark:bg-forest-900 text-xs font-bold text-stone-700 dark:text-stone-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 font-bold text-xs sm:text-sm shadow-md hover:scale-105 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving Recipe...' : isEditMode ? 'Update Recipe' : 'Publish Recipe'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;
