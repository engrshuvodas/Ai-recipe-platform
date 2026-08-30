import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Heart, Sparkles, ShieldCheck, ShoppingBag, Globe, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-20 border-t border-stone-200 dark:border-forest-900/80 bg-[#FAF7F2] dark:bg-[#061913] text-stone-700 dark:text-stone-300 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-forest-900 border border-gold-500/40 flex items-center justify-center shadow-md">
                <UtensilsCrossed className="w-5 h-5 text-gold-400" />
              </div>
              <span className="text-xl font-serif font-bold text-forest-900 dark:text-cream-50">
                Recipe<span className="text-gold-500">Companion</span>
              </span>
            </Link>
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-sm leading-relaxed">
              Your comprehensive full-stack culinary companion. Explore authentic world and regional flavors, plan your nutrition, generate smart recipes with AI, and order fresh ingredients in minutes.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-forest-100 dark:bg-forest-900 text-forest-900 dark:text-gold-400 border border-gold-500/30">
                ⚡ 10-Min Groceries Integrated
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-forest-100 dark:bg-forest-900 text-forest-900 dark:text-gold-400 border border-gold-500/30">
                ✨ AI Chef Powered
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white mb-4">Culinary Discovery</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/explore" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  Explore All Recipes
                </Link>
              </li>
              <li>
                <Link to="/regional" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  Country & State Cuisines
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Breakfast" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  Morning Breakfasts
                </Link>
              </li>
              <li>
                <Link to="/explore?dietary=Vegetarian" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  Vegetarian & Vegan Delights
                </Link>
              </li>
              <li>
                <Link to="/explore?dietary=High-Protein" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  High Protein & Fitness Meals
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white mb-4">Smart Tools</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/ai-studio" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                  <span>AI Recipe Generator</span>
                </Link>
              </li>
              <li>
                <Link to="/meal-planner" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  Weekly & Monthly Planner
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  Food Clubs & Discussions
                </Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  Chef & Foodie Direct Chat
                </Link>
              </li>
              <li>
                <Link to="/recipe/new" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  Upload Your Recipe
                </Link>
              </li>
            </ul>
          </div>

          {/* Grocery Partners */}
          <div>
            <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white mb-4">Grocery Direct Links</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
              1-Click ingredient checkout through our direct query links:
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
                ⚡ Blinkit
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-300">
                🚀 Zepto
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-lime-100 text-lime-900 dark:bg-lime-950/70 dark:text-lime-300">
                🧺 BigBasket
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-900 dark:bg-orange-950/70 dark:text-orange-300">
                🛍️ Swiggy Instamart
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-200 dark:border-forest-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Recipe Companion. Crafted with passion for global gastronomy.</p>
          <div className="flex items-center gap-4">
            <span>English • हिन्दी • Español • Français • Deutsch</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
