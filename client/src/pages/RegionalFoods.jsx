import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recipeAPI } from '../services/api';
import RecipeCard from '../components/recipe/RecipeCard';
import { Globe, MapPin, Sparkles, ChevronRight, UtensilsCrossed, Compass } from 'lucide-react';

const RegionalFoods = () => {
  const [activeTab, setActiveTab] = useState('states'); // 'states' | 'countries'
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const indianStatesInfo = [
    {
      name: 'Punjab',
      flag: '🌾',
      desc: 'Land of golden wheat fields, rich butter chicken, velvety sarson ka saag, and tandoori charcoal ovens.',
      signature: 'Murgh Makhani & Paneer Tikka',
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Tamil Nadu',
      flag: '🥥',
      desc: 'Crispy fermented rice dosas, aromatic filter coffee, and spicy Chettinad black pepper curries.',
      signature: 'Masala Dosa & Sambar',
      image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Telangana',
      flag: '👑',
      desc: 'Royal Nizami dum biryanis slow-cooked under sealed dough, infused with saffron and shahi spices.',
      signature: 'Hyderabadi Dum Biryani',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Kerala',
      flag: '🌴',
      desc: 'God’s Own Country brings fresh coconut milk curries, mustard tempering, and coastal fish moilee.',
      signature: 'Meen Moilee & Appams',
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Rajasthan',
      flag: '🏰',
      desc: 'Royal desert feast of charcoal-baked baatis soaked in desi ghee, panchmel dal, and sweet churma.',
      signature: 'Dal Baati Churma',
      image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Maharashtra',
      flag: '🌶️',
      desc: 'Spicy sprouted bean misal pav, puran poli, and vibrant street foods bursting with fiery flavors.',
      signature: 'Kolhapuri Misal & Pav',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const countriesInfo = [
    {
      name: 'Italy',
      flag: '🇮🇹',
      desc: 'Handcrafted bronze-die pasta, San Marzano tomatoes, fresh buffalo mozzarella, and wood-fired pizza.',
      signature: 'Pizza Margherita & Truffle Pasta',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Mexico',
      flag: '🇲🇽',
      desc: 'Smoky chipotle adobo, fresh grilled pineapples, double corn tortillas, and fresh lime salsa verde.',
      signature: 'Tacos al Pastor',
      image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Japan',
      flag: '🇯🇵',
      desc: 'Rich umami broths, springy handmade ramen noodles, jammy soft-boiled eggs, and delicate sushi.',
      signature: 'Tokyo Shoyu Ramen',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Thailand',
      flag: '🇹🇭',
      desc: 'Fragrant lemongrass, cracked coconut cream, kaffir lime, and fiery Thai green curry pastes.',
      signature: 'Thai Coconut Green Curry',
      image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'France',
      flag: '🇫🇷',
      desc: 'Golden flaky laminated butter croissants, velvety chocolate molten lava cakes, and classic pastry arts.',
      signature: 'Butter Croissants & Lava Cake',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    },
  ];

  useEffect(() => {
    fetchRegionalRecipes();
  }, [activeTab, selectedRegion]);

  const fetchRegionalRecipes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab === 'states') {
        if (selectedRegion !== 'All') params.state = selectedRegion;
        else params.country = 'India';
      } else {
        if (selectedRegion !== 'All') params.country = selectedRegion;
      }
      const res = await recipeAPI.getAll(params);
      setRecipes(res.data.recipes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentList = activeTab === 'states' ? indianStatesInfo : countriesInfo;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100 dark:bg-forest-900/80 text-forest-900 dark:text-gold-300 border border-gold-500/30 text-xs font-bold">
          <Compass className="w-3.5 h-3.5 text-gold-500" />
          <span>Regional Food Heritage Hub</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-forest-900 dark:text-cream-50">
          World & Indian State-Wise Flavors
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
          Explore iconic regional dishes rooted in culinary heritage and cultural traditions
        </p>

        {/* Tab Toggle */}
        <div className="inline-flex rounded-2xl bg-stone-200 dark:bg-forest-950 p-1.5 border border-stone-300 dark:border-forest-800 shadow-inner">
          <button
            onClick={() => {
              setActiveTab('states');
              setSelectedRegion('All');
            }}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'states'
                ? 'bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 shadow-sm'
                : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            🇮🇳 Indian States & Regions
          </button>
          <button
            onClick={() => {
              setActiveTab('countries');
              setSelectedRegion('All');
            }}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'countries'
                ? 'bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 shadow-sm'
                : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            🌍 Global Cuisines & Nations
          </button>
        </div>
      </div>

      {/* Regional Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentList.map((item) => {
          const isSelected = selectedRegion === item.name;
          return (
            <div
              key={item.name}
              onClick={() => setSelectedRegion(isSelected ? 'All' : item.name)}
              className={`group relative overflow-hidden rounded-3xl cursor-pointer border transition-all duration-300 shadow-card ${
                isSelected
                  ? 'ring-4 ring-gold-500 border-gold-500 scale-[1.02]'
                  : 'border-stone-200 dark:border-forest-800 hover:border-gold-500/70 hover:scale-[1.01]'
              }`}
            >
              <div className="h-44 w-full relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.flag}</span>
                    <h3 className="font-serif font-bold text-xl drop-shadow-sm">{item.name}</h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gold-500 text-forest-950 font-bold">
                    {isSelected ? 'Viewing' : 'Explore'}
                  </span>
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-[#0e271f] space-y-2">
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
                <div className="pt-2 border-t border-stone-100 dark:border-forest-900 flex items-center justify-between text-[11px]">
                  <span className="text-stone-400 font-semibold">Signature Dish:</span>
                  <span className="font-bold text-gold-600 dark:text-gold-400">{item.signature}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtered Recipes Showcase */}
      <div className="space-y-6 pt-6 border-t border-stone-200 dark:border-forest-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-forest-900 dark:text-cream-50">
              {selectedRegion === 'All'
                ? activeTab === 'states'
                  ? 'All Regional Indian Recipes'
                  : 'All International Recipes'
                : `Authentic ${selectedRegion} Dishes`}
            </h2>
            <p className="text-xs text-stone-500">
              Found {recipes.length} signature recipes
            </p>
          </div>

          {selectedRegion !== 'All' && (
            <button
              onClick={() => setSelectedRegion('All')}
              className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline"
            >
              Show All Regions
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-stone-200 dark:bg-forest-950 animate-pulse" />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-stone-100 dark:bg-forest-950 text-stone-500 text-xs">
            No recipes currently loaded for this region. Upload one or generate it using our AI Studio!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionalFoods;
