import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Heart, Bookmark, Star, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { recipeAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const RecipeCard = ({ recipe, onLikeToggle }) => {
  const { user, isAuthenticated, toggleSaveRecipe } = useAuth();
  const { toast } = useToast();
  
  const [likesCount, setLikesCount] = useState(recipe.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(() => {
    if (!user || !recipe.likes) return false;
    return recipe.likes.some((l) => (typeof l === 'string' ? l : l._id) === user._id);
  });
  const [isLiking, setIsLiking] = useState(false);

  const isSaved = user?.savedRecipes?.some(
    (id) => (typeof id === 'string' ? id : id._id) === recipe._id
  );

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please sign in to like recipes');
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    try {
      const res = await recipeAPI.toggleLike(recipe._id);
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
      if (onLikeToggle) onLikeToggle(recipe._id, res.data.liked);
    } catch (err) {
      toast.error('Failed to like recipe');
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleSaveRecipe(recipe._id);
  };

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const mainImage = recipe.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group relative bg-white dark:bg-[#0e271f] rounded-3xl overflow-hidden border border-stone-200/80 dark:border-forest-800/80 shadow-soft recipe-card-hover flex flex-col justify-between">
      {/* Top Media & Floating Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 dark:bg-forest-950">
        <Link to={`/recipe/${recipe._id}`} className="block w-full h-full">
          <img
            src={mainImage}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-forest-900/90 text-gold-300 backdrop-blur-md border border-gold-500/30 shadow-sm">
              {recipe.cuisine}
            </span>
            {recipe.isAIGenerated && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-1 rounded-full bg-amber-500 text-forest-950 shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI
              </span>
            )}
          </div>

          {/* Save / Bookmark Button */}
          <button
            onClick={handleBookmark}
            className="pointer-events-auto w-8 h-8 rounded-full glass-modal flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-gold-500 shadow-md hover:scale-110 transition-all"
            title={isSaved ? 'Remove from Saved' : 'Save Recipe'}
          >
            <Bookmark
              className={`w-4 h-4 ${isSaved ? 'fill-gold-500 text-gold-500' : ''}`}
            />
          </button>
        </div>

        {/* Bottom Regional & Category info on Image */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white pointer-events-none">
          {recipe.state || recipe.country ? (
            <div className="flex items-center gap-1 text-xs font-semibold text-stone-200 drop-shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              <span>{recipe.state ? `${recipe.state}, ${recipe.country}` : recipe.country}</span>
            </div>
          ) : (
            <span className="text-xs font-medium text-stone-200">{recipe.category}</span>
          )}

          {/* Rating Pill */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 font-bold text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{recipe.averageRating ? recipe.averageRating.toFixed(1) : '5.0'}</span>
            {recipe.ratingCount > 0 && <span className="text-[10px] text-stone-300 font-normal">({recipe.ratingCount})</span>}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <Link to={`/recipe/${recipe._id}`} className="block">
            <h3 className="font-serif font-bold text-lg text-forest-900 dark:text-cream-50 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors line-clamp-2 leading-snug">
              {recipe.title}
            </h3>
          </Link>
          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mt-1.5 leading-relaxed">
            {recipe.description}
          </p>
        </div>

        {/* Dietary Tags preview */}
        {recipe.dietary && recipe.dietary.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.dietary.slice(0, 3).map((diet, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-forest-900/60 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-forest-800"
              >
                {diet}
              </span>
            ))}
            {recipe.dietary.length > 3 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 text-stone-400">
                +{recipe.dietary.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer Meta & Likes */}
        <div className="pt-3 border-t border-stone-100 dark:border-forest-900/80 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-3 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gold-500" />
              <span>{totalTime} mins</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gold-500" />
              <span>{recipe.servings} serv</span>
            </span>
          </div>

          <button
            onClick={handleLike}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${
              isLiked
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold'
                : 'hover:bg-stone-100 dark:hover:bg-forest-900/50 text-stone-600 dark:text-stone-300'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{likesCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
