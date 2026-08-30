import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recipeAPI } from '../services/api';
import RecipeCard from '../components/recipe/RecipeCard';
import { useLanguage } from '../context/LanguageContext';
import {
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  ShoppingBag,
  ChefHat,
  Flame,
  Globe,
  Utensils,
  Award,
  Zap,
} from 'lucide-react';

const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [regions, setRegions] = useState({ countries: [], states: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featRes, regRes] = await Promise.all([
          recipeAPI.getFeatured(),
          recipeAPI.getRegions(),
        ]);
        setFeaturedRecipes(featRes.data.recipes || []);
        setRegions(regRes.data || { countries: [], states: [] });
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const cuisineCategories = [
    { name: 'Indian Curries', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=400&q=80', query: 'cuisine=Indian' },
    { name: 'Italian & Pizza', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80', query: 'cuisine=Italian' },
    { name: 'South Indian', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80', query: 'cuisine=South Indian' },
    { name: 'Asian & Ramen', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80', query: 'cuisine=Japanese' },
    { name: 'Healthy & Vegan', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80', query: 'dietary=Vegetarian' },
    { name: 'Artisan Bakery', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80', query: 'category=Bakery' },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24">
        {/* Background glow accents */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-gold-500/10 dark:bg-forest-700/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-100 dark:bg-forest-900/80 border border-gold-500/40 text-forest-900 dark:text-gold-300 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>Gourmet Culinary Platform with AI & 10-Min Grocery Checkout</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-forest-900 dark:text-cream-50 leading-[1.15]">
              {t('heroTitle', 'Savor Every Flavor, Master Every Recipe')}
            </h1>

            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
              {t(
                'heroSubtitle',
                'Discover thousands of authentic global and regional recipes, generate personalized meals with AI, plan your weekly nutrition, and buy fresh ingredients in 10 minutes.'
              )}
            </p>

            {/* Smart Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative max-w-2xl mx-auto mt-8 flex items-center p-2 rounded-3xl bg-white dark:bg-[#0e271f] border border-stone-300 dark:border-forest-800 shadow-card hover:border-gold-500 transition-all"
            >
              <Search className="w-5 h-5 text-stone-400 ml-3.5 shrink-0" />
              <input
                type="text"
                placeholder={t('heroSearchPlaceholder', 'Search ingredients (e.g. paneer, spinach, pasta), cuisines or recipes...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none placeholder:text-stone-400"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-2xl bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 font-bold text-xs sm:text-sm shadow-md hover:scale-105 transition-all shrink-0"
              >
                {t('heroSearchBtn', 'Search Recipes')}
              </button>
            </form>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-xs font-semibold text-stone-600 dark:text-stone-300">
              <span className="text-stone-400">Popular Searches:</span>
              {['Butter Chicken', 'Masala Dosa', 'Neapolitan Pizza', 'Ramen', 'Dal Baati', 'High Protein'].map((term) => (
                <button
                  key={term}
                  onClick={() => navigate(`/explore?search=${encodeURIComponent(term)}`)}
                  className="px-3 py-1 rounded-xl bg-stone-100 dark:bg-forest-950 hover:bg-gold-100 dark:hover:bg-forest-900 border border-stone-200 dark:border-forest-800 text-[11px] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* THREE PILLAR HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Regional Hub */}
          <div className="p-7 rounded-3xl bg-gradient-to-br from-forest-900 to-forest-950 text-cream-50 border border-gold-500/30 shadow-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
                <Globe className="w-6 h-6 text-gold-400" />
              </div>
              <h3 className="text-xl font-serif font-bold">Country & State Cuisines</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Explore distinct regional culinary heritage from Punjab, Kerala, Rajasthan, Maharashtra, to Italy, Mexico, and Japan with step-by-step guidance.
              </p>
            </div>
            <Link
              to="/regional"
              className="inline-flex items-center gap-2 text-xs font-bold text-gold-400 hover:text-gold-300 group"
            >
              <span>Explore Regional Foods</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 2: AI Chef Studio */}
          <div className="p-7 rounded-3xl bg-gradient-to-br from-[#1b4334] to-[#123126] text-cream-50 border border-gold-500/30 shadow-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>
              <h3 className="text-xl font-serif font-bold">AI Recipe Studio</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Got random ingredients in your fridge? Tell our AI Chef what you have and any allergies to exclude. Get a tailored gourmet recipe instantly.
              </p>
            </div>
            <Link
              to="/ai-studio"
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-200 group"
            >
              <span>Launch AI Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 3: 10-Min Groceries */}
          <div className="p-7 rounded-3xl bg-gradient-to-br from-forest-900 to-forest-950 text-cream-50 border border-gold-500/30 shadow-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-gold-400" />
              </div>
              <h3 className="text-xl font-serif font-bold">1-Click Grocery Purchasing</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Select ingredients and order directly through deep-links to Blinkit, Zepto, and BigBasket. No manual searching required.
              </p>
            </div>
            <Link
              to="/meal-planner"
              className="inline-flex items-center gap-2 text-xs font-bold text-gold-400 hover:text-gold-300 group"
            >
              <span>Smart Meal Planner</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* POPULAR CUISINES CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 dark:text-cream-50">
              Popular Culinary Categories
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Browse dishes curated by taste, tradition, and dietary lifestyle
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold text-forest-900 dark:text-gold-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {cuisineCategories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/explore?${cat.query}`}
              className="group relative h-40 rounded-2xl overflow-hidden shadow-sm hover:shadow-card transition-all hover:scale-105 border border-stone-200 dark:border-forest-800"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-center">
                <span className="text-xs font-bold text-white group-hover:text-gold-300 transition-colors drop-shadow-sm">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED CHEF RECIPES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-1">
              <Award className="w-4 h-4" />
              <span>Chef Selected</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 dark:text-cream-50">
              {t('featuredRecipes', 'Chef Curated Masterpieces')}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              {t('featuredSub', 'Handcrafted signature dishes celebrated across cultures and kitchens')}
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold text-forest-900 dark:text-gold-400 hover:underline flex items-center gap-1"
          >
            <span>Explore All ({featuredRecipes.length}+)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-stone-200 dark:bg-forest-950 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRecipes.slice(0, 8).map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}
      </section>

      {/* REGIONAL CUISINE TEASER (STATES & COUNTRIES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-[#0e3b2e] via-[#164e3d] to-[#08281f] text-cream-50 border border-gold-500/30 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-bold">
              <Globe className="w-3.5 h-3.5 text-gold-400" />
              <span>Regional India & Global Gastronomy</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold leading-tight">
              A Culinary Pilgrimage Through India's States & The World
            </h2>

            <p className="text-sm text-stone-300 leading-relaxed">
              From the slow-cooked dum biryanis of Hyderabad and buttery curries of Punjab to authentic wood-fired pizzas of Naples and aromatic street ramen of Tokyo, taste the heritage in every bite.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/regional"
                className="px-6 py-3 rounded-2xl bg-gold-500 hover:bg-gold-600 text-forest-950 font-bold text-xs shadow-md hover:scale-105 transition-all"
              >
                Explore State-wise Foods
              </Link>
              <Link
                to="/ai-studio"
                className="px-6 py-3 rounded-2xl bg-forest-950/80 hover:bg-black text-cream-50 border border-gold-500/40 font-bold text-xs transition-all"
              >
                Generate Custom Dish
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
