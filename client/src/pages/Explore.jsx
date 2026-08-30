import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { recipeAPI } from '../services/api';
import RecipeCard from '../components/recipe/RecipeCard';
import { useLanguage } from '../context/LanguageContext';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Globe,
  Utensils,
} from 'lucide-react';

const Explore = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [cuisine, setCuisine] = useState(searchParams.get('cuisine') || 'All');
  const [country, setCountry] = useState(searchParams.get('country') || 'All');
  const [state, setState] = useState(searchParams.get('state') || 'All');
  const [selectedDiets, setSelectedDiets] = useState(() => {
    const d = searchParams.get('dietary');
    return d ? d.split(',') : [];
  });
  const [maxTime, setMaxTime] = useState(searchParams.get('maxTime') || '');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const categories = [
    'All',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Dessert',
    'Snack',
    'Bakery',
    'Soup',
    'Salad',
  ];

  const cuisines = [
    'All',
    'Indian',
    'South Indian',
    'Italian',
    'Mexican',
    'Japanese',
    'Thai',
    'French',
    'Healthy / Modern',
  ];

  const indianStates = [
    'All',
    'Punjab',
    'Tamil Nadu',
    'Telangana',
    'Kerala',
    'Rajasthan',
    'Maharashtra',
    'West Bengal',
    'Gujarat',
    'Goa',
    'Kashmir',
  ];

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'High-Protein',
    'Nut-Free',
    'Low-Calorie',
  ];

  useEffect(() => {
    fetchRecipes();
  }, [category, cuisine, country, state, selectedDiets, maxTime, difficulty, sort, page]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        sort,
      };

      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;
      if (cuisine !== 'All') params.cuisine = cuisine;
      if (country !== 'All') params.country = country;
      if (state !== 'All') params.state = state;
      if (selectedDiets.length > 0) params.dietary = selectedDiets.join(',');
      if (maxTime) params.maxTime = maxTime;
      if (difficulty !== 'All') params.difficulty = difficulty;

      const res = await recipeAPI.getAll(params);
      setRecipes(res.data.recipes || []);
      setTotalCount(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecipes();
  };

  const toggleDiet = (diet) => {
    setSelectedDiets((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setCuisine('All');
    setCountry('All');
    setState('All');
    setSelectedDiets([]);
    setMaxTime('');
    setDifficulty('All');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest-900 dark:text-cream-50">
            Explore Gourmet Recipes
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Filter by ingredients, country, Indian state, dietary preference, and cook time
          </p>
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recipes, ingredients, or cuisines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-24 py-3 rounded-2xl bg-white dark:bg-[#0e271f] border border-stone-200 dark:border-forest-800 text-xs sm:text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:border-gold-500 shadow-xs"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 text-xs font-bold shadow-xs hover:scale-105 transition-transform"
            >
              Search
            </button>
          </form>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-3 rounded-2xl bg-white dark:bg-[#0e271f] border border-stone-200 dark:border-forest-800 text-xs font-semibold text-stone-700 dark:text-stone-200 focus:outline-none focus:border-gold-500 shadow-xs w-full sm:w-auto"
            >
              <option value="newest">✨ Newest First</option>
              <option value="rating">⭐ Highest Rated</option>
              <option value="popular">❤️ Most Popular</option>
              <option value="time">⏱️ Quickest Cook Time</option>
            </select>

            <button
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-3 rounded-2xl bg-stone-100 dark:bg-forest-900 text-xs font-bold text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-forest-800"
            >
              <SlidersHorizontal className="w-4 h-4 text-gold-500" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 shadow-sm'
                  : 'bg-white dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800/80 text-stone-600 dark:text-stone-300 hover:border-gold-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Recipe Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters Desktop */}
        <aside className={`lg:block ${isFilterDrawerOpen ? 'block' : 'hidden'} space-y-6 bg-white dark:bg-[#0e271f] p-6 rounded-3xl border border-stone-200 dark:border-forest-800 shadow-soft sticky top-28`}>
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-forest-800">
            <h3 className="font-serif font-bold text-base text-forest-900 dark:text-cream-50 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gold-500" />
              <span>Filters</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-stone-400 hover:text-gold-500 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Cuisine Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              Cuisine
            </label>
            <select
              value={cuisine}
              onChange={(e) => {
                setCuisine(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-forest-950 border border-stone-200 dark:border-forest-800 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:border-gold-500"
            >
              {cuisines.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Indian State Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              Indian State
            </label>
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-forest-950 border border-stone-200 dark:border-forest-800 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:border-gold-500"
            >
              {indianStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Max Cooking Time */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-700 dark:text-stone-300">Max Cook Time</span>
              <span className="font-mono text-gold-600 dark:text-gold-400 font-bold">
                {maxTime ? `${maxTime} mins` : 'Any'}
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="90"
              step="15"
              value={maxTime || 90}
              onChange={(e) => {
                setMaxTime(e.target.value === '90' ? '' : e.target.value);
                setPage(1);
              }}
              className="w-full accent-gold-500"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono">
              <span>15m</span>
              <span>30m</span>
              <span>45m</span>
              <span>60m</span>
              <span>Any</span>
            </div>
          </div>

          {/* Dietary Checkboxes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              Dietary Lifestyle
            </label>
            <div className="space-y-1.5 max-h-44 overflow-y-auto">
              {dietaryOptions.map((diet) => {
                const isSelected = selectedDiets.includes(diet);
                return (
                  <label
                    key={diet}
                    onClick={() => toggleDiet(diet)}
                    className="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-forest-950 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded text-gold-500 focus:ring-0"
                    />
                    <span>{diet}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    setDifficulty(diff);
                    setPage(1);
                  }}
                  className={`py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                    difficulty === diff
                      ? 'bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 border-transparent'
                      : 'bg-stone-50 dark:bg-forest-950 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-forest-800'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Recipes Grid */}
        <main className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>
              Showing <strong className="text-stone-900 dark:text-cream-50">{recipes.length}</strong> of{' '}
              <strong className="text-stone-900 dark:text-cream-50">{totalCount}</strong> recipes
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 rounded-3xl bg-stone-200 dark:bg-forest-950 animate-pulse" />
              ))}
            </div>
          ) : recipes.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0e271f] border border-stone-200 dark:border-forest-800 space-y-4">
              <div className="w-16 h-16 rounded-full bg-forest-100 dark:bg-forest-900 flex items-center justify-center mx-auto text-forest-800 dark:text-gold-400">
                <Utensils className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-xl text-forest-900 dark:text-cream-50">
                No matching recipes found
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try adjusting your search terms or relaxing some dietary or cooking time filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-gold-500 text-forest-950 font-bold text-xs rounded-xl shadow-xs"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {[...Array(totalPages)].map((_, i) => {
                const pageNumber = i + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      page === pageNumber
                        ? 'bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 shadow-sm'
                        : 'bg-white dark:bg-forest-950 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-forest-800 hover:border-gold-500'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Explore;
