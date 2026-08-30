import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { recipeAPI } from '../../services/api';
import { Search, Plus, Utensils, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AddMealModal = ({ isOpen, onClose, date, dayOfWeek, slot = 'breakfast', onMealAdded }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'custom'
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRecipes();
    }
  }, [isOpen, searchTerm]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const res = await recipeAPI.getAll({ search: searchTerm, limit: 10 });
      setRecipes(res.data.recipes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecipe = (recipe) => {
    onMealAdded({
      date,
      dayOfWeek,
      slot,
      recipeId: recipe._id,
      customTitle: recipe.title,
      notes: '',
    });
    onClose();
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    onMealAdded({
      date,
      dayOfWeek,
      slot,
      recipeId: null,
      customTitle: customTitle.trim(),
      notes: customNotes.trim(),
    });
    setCustomTitle('');
    setCustomNotes('');
    onClose();
  };

  const slotLabels = {
    breakfast: '🍳 Breakfast',
    lunch: '🥗 Lunch',
    dinner: '🍲 Dinner',
    snacks: '🥑 Snacks & Smoothies',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add ${slotLabels[slot] || slot}`}
      subtitle={`Plan your meal for ${dayOfWeek} (${date})`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-stone-100 dark:bg-forest-950 p-1 border border-stone-200 dark:border-forest-800">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'browse'
                ? 'bg-forest-900 text-cream-50 dark:bg-forest-700 shadow-sm'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            Pick From Recipes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'custom'
                ? 'bg-forest-900 text-cream-50 dark:bg-forest-700 shadow-sm'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            Custom Meal Entry
          </button>
        </div>

        {activeTab === 'browse' ? (
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search recipe by name or cuisine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:border-gold-500"
              />
            </div>

            {/* Recipe List */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {loading ? (
                <p className="text-center py-6 text-xs text-stone-500">Loading recipes...</p>
              ) : recipes.length === 0 ? (
                <p className="text-center py-6 text-xs text-stone-500">No matching recipes found</p>
              ) : (
                recipes.map((r) => (
                  <div
                    key={r._id}
                    onClick={() => handleSelectRecipe(r)}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-forest-900/40 hover:bg-forest-50 dark:hover:bg-forest-900/80 border border-stone-200 dark:border-forest-800 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={r.images?.[0]}
                        alt={r.title}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-stone-900 dark:text-cream-50">{r.title}</p>
                        <p className="text-[10px] text-stone-500">{r.cuisine} • {r.prepTime + r.cookTime} mins</p>
                      </div>
                    </div>
                    <span className="p-1.5 rounded-xl bg-forest-900 text-gold-400">
                      <Plus className="w-4 h-4" />
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleAddCustom} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Meal Name / Dish Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Grilled Salmon with Asparagus or Overnight Oats"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-xs focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Prep Notes / Nutrition Goal
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Prep marinade the night before, aim for 40g protein"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-xs focus:outline-none focus:border-gold-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 font-bold text-xs shadow-md hover:scale-[1.02] transition-all"
            >
              Add to {slotLabels[slot] || slot}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default AddMealModal;
