import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { recipeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import StarRating from '../components/common/StarRating';
import ServingScaler, { scaleQuantity } from '../components/recipe/ServingScaler';
import KitchenTimer from '../components/recipe/KitchenTimer';
import BuyIngredientsModal from '../components/recipe/BuyIngredientsModal';
import ShareModal from '../components/recipe/ShareModal';
import ChefAssistantModal from '../components/ai/ChefAssistantModal';
import RecipeCard from '../components/recipe/RecipeCard';
import {
  Clock,
  Users,
  Flame,
  Bookmark,
  Heart,
  Share2,
  ChefHat,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  MapPin,
  Utensils,
  HelpCircle,
  Play,
  Send,
} from 'lucide-react';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, toggleSaveRecipe } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [recipe, setRecipe] = useState(null);
  const [similarRecipes, setSimilarRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scaler State
  const [servings, setServings] = useState(4);
  const [originalServings, setOriginalServings] = useState(4);

  // Checklist state
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Modals state
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isChefModalOpen, setIsChefModalOpen] = useState(false);

  // Likes & Ratings State
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    fetchRecipeDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const fetchRecipeDetail = async () => {
    try {
      setLoading(true);
      const res = await recipeAPI.getById(id);
      const data = res.data.recipe;
      setRecipe(data);
      setSimilarRecipes(res.data.similarRecipes || []);
      setServings(data.servings || 4);
      setOriginalServings(data.servings || 4);
      setLikesCount(data.likes?.length || 0);

      if (user && data.likes) {
        setIsLiked(data.likes.some((l) => (typeof l === 'string' ? l : l._id) === user._id));
      }
    } catch (err) {
      toast.error('Recipe not found');
      navigate('/explore');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to like recipes');
      return;
    }
    try {
      const res = await recipeAPI.toggleLike(recipe._id);
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      toast.error('Failed to like recipe');
    }
  };

  const handleBookmark = async () => {
    await toggleSaveRecipe(recipe._id);
  };

  const toggleIngredientCheck = (idx) => {
    setCheckedIngredients((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const toggleStepComplete = (stepNum) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNum) ? prev.filter((s) => s !== stepNum) : [...prev, stepNum]
    );
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please sign in to leave a review');
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await recipeAPI.rate(recipe._id, {
        rating: myRating,
        comment: myComment,
      });
      setRecipe((prev) => ({
        ...prev,
        ratings: res.data.ratings,
        averageRating: res.data.averageRating,
        ratingCount: res.data.ratingCount,
      }));
      setMyComment('');
      toast.success('Thank you for rating this recipe!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading || !recipe) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full border-4 border-gold-500 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-stone-500">Preparing recipe details...</p>
      </div>
    );
  }

  const scaleRatio = servings / originalServings;
  const isSaved = user?.savedRecipes?.some(
    (item) => (typeof item === 'string' ? item : item._id) === recipe._id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-xs font-semibold text-stone-500">
          <Link to="/" className="hover:text-gold-500">Home</Link>
          <span>/</span>
          <Link to="/explore" className="hover:text-gold-500">Recipes</Link>
          <span>/</span>
          <span className="text-stone-900 dark:text-cream-50 truncate max-w-xs">{recipe.title}</span>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl border text-xs font-bold transition-all ${
              isLiked
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'bg-white dark:bg-forest-900 border-stone-200 dark:border-forest-800 text-stone-700 dark:text-stone-200 hover:border-gold-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{likesCount} Likes</span>
          </button>

          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl border text-xs font-bold transition-all ${
              isSaved
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-600 dark:text-gold-400 shadow-xs'
                : 'bg-white dark:bg-forest-900 border-stone-200 dark:border-forest-800 text-stone-700 dark:text-stone-200 hover:border-gold-500'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-gold-500 text-gold-500' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="p-2 rounded-2xl bg-white dark:bg-forest-900 border border-stone-200 dark:border-forest-800 text-stone-700 dark:text-stone-200 hover:text-gold-500 transition-colors"
            title="Share Recipe"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Card with Large Photo & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white dark:bg-[#0e271f] p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-forest-800 shadow-card">
        {/* Left Col: Meta Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-forest-900 text-gold-300 dark:bg-gold-500 dark:text-forest-950">
              {recipe.cuisine}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 dark:bg-forest-950 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-forest-800">
              {recipe.category}
            </span>
            {recipe.state || recipe.country ? (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 dark:bg-forest-950 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-forest-800 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gold-500" />
                <span>{recipe.state ? `${recipe.state}, ${recipe.country}` : recipe.country}</span>
              </span>
            ) : null}
            {recipe.isAIGenerated && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400 text-forest-950 flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3" /> AI Generated
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-forest-900 dark:text-cream-50 leading-tight">
            {recipe.title}
          </h1>

          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
            {recipe.description}
          </p>

          {/* Author & Rating Pill */}
          <div className="flex items-center gap-6 pt-2">
            <Link to={`/user/${recipe.author?._id}`} className="flex items-center gap-3 group">
              <img
                src={recipe.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={recipe.author?.name}
                className="w-10 h-10 rounded-2xl object-cover ring-2 ring-gold-500/50"
              />
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-cream-50 group-hover:text-gold-500 transition-colors">
                  {recipe.author?.name}
                </p>
                <p className="text-[11px] text-stone-500">Master Contributor</p>
              </div>
            </Link>

            <div className="border-l border-stone-200 dark:border-forest-800 pl-6">
              <div className="flex items-center gap-1.5">
                <StarRating rating={recipe.averageRating || 5} size="sm" />
                <span className="text-xs font-bold text-stone-900 dark:text-cream-50">
                  {recipe.averageRating?.toFixed(1) || '5.0'}
                </span>
                <span className="text-xs text-stone-400">({recipe.ratingCount || 0} reviews)</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-stone-100 dark:border-forest-900/80">
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-forest-950/70 text-center">
              <p className="text-[10px] uppercase font-bold text-stone-400">Prep Time</p>
              <p className="text-sm font-bold text-forest-900 dark:text-cream-50">{recipe.prepTime} min</p>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-forest-950/70 text-center">
              <p className="text-[10px] uppercase font-bold text-stone-400">Cook Time</p>
              <p className="text-sm font-bold text-forest-900 dark:text-cream-50">{recipe.cookTime} min</p>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-forest-950/70 text-center">
              <p className="text-[10px] uppercase font-bold text-stone-400">Difficulty</p>
              <p className="text-sm font-bold text-forest-900 dark:text-cream-50">{recipe.difficulty}</p>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-forest-950/70 text-center">
              <p className="text-[10px] uppercase font-bold text-stone-400">Calories</p>
              <p className="text-sm font-bold text-gold-600 dark:text-gold-400">
                {recipe.nutritionFacts?.calories || 420} kcal
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: High-Res Image */}
        <div className="lg:col-span-5 h-80 sm:h-96 rounded-3xl overflow-hidden shadow-card border border-stone-200 dark:border-forest-800 relative group">
          <img
            src={recipe.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <button
            onClick={() => setIsChefModalOpen(true)}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-3.5 py-2 rounded-2xl glass-modal text-xs font-bold text-forest-900 dark:text-cream-50 hover:border-gold-500 shadow-md hover:scale-105 transition-all"
          >
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span>Ask AI Chef Tips</span>
          </button>
        </div>
      </div>

      {/* Main Content: Scaled Ingredients & Step-by-Step Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* INGREDIENTS CHECKLIST (4 COLS) */}
        <div className="lg:col-span-5 space-y-6 bg-white dark:bg-[#0e271f] p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-forest-800 shadow-soft sticky top-28">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl text-forest-900 dark:text-cream-50">
                Ingredients List
              </h3>
              <button
                onClick={() => setIsBuyModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-forest-950 font-bold text-xs shadow-xs hover:scale-105 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buy on Blinkit/Zepto</span>
              </button>
            </div>

            {/* Serving Scaler */}
            <ServingScaler
              currentServings={servings}
              originalServings={originalServings}
              onServingsChange={setServings}
            />
          </div>

          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
            {recipe.ingredients.map((ing, idx) => {
              const isChecked = checkedIngredients.includes(idx);
              const scaledQty = scaleQuantity(ing.quantity, scaleRatio);
              return (
                <div
                  key={idx}
                  onClick={() => toggleIngredientCheck(idx)}
                  className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-stone-50 dark:bg-forest-950/40 border-stone-200 dark:border-forest-900 opacity-50'
                      : 'bg-stone-50/60 dark:bg-forest-950/60 border-stone-200 dark:border-forest-800/80 hover:border-gold-500/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="mt-0.5 rounded text-gold-500 focus:ring-0"
                  />
                  <div className="flex-1">
                    <p
                      className={`text-xs font-bold ${
                        isChecked ? 'line-through text-stone-400' : 'text-stone-900 dark:text-cream-50'
                      }`}
                    >
                      <span className="text-gold-600 dark:text-gold-400 font-mono mr-1.5">
                        {scaledQty} {ing.unit}
                      </span>
                      {ing.name}
                    </p>
                    {ing.note && <p className="text-[11px] text-stone-400 italic">{ing.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Macro Nutrition Summary */}
          {recipe.nutritionFacts && (
            <div className="pt-4 border-t border-stone-100 dark:border-forest-900 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Nutritional Breakdown (per serving)
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-stone-100 dark:bg-forest-950">
                  <p className="text-[10px] text-stone-400 font-semibold">Protein</p>
                  <p className="font-bold text-forest-900 dark:text-cream-50">{recipe.nutritionFacts.protein}g</p>
                </div>
                <div className="p-2 rounded-xl bg-stone-100 dark:bg-forest-950">
                  <p className="text-[10px] text-stone-400 font-semibold">Carbs</p>
                  <p className="font-bold text-forest-900 dark:text-cream-50">{recipe.nutritionFacts.carbs}g</p>
                </div>
                <div className="p-2 rounded-xl bg-stone-100 dark:bg-forest-950">
                  <p className="text-[10px] text-stone-400 font-semibold">Fat</p>
                  <p className="font-bold text-forest-900 dark:text-cream-50">{recipe.nutritionFacts.fat}g</p>
                </div>
                <div className="p-2 rounded-xl bg-stone-100 dark:bg-forest-950">
                  <p className="text-[10px] text-stone-400 font-semibold">Fiber</p>
                  <p className="font-bold text-forest-900 dark:text-cream-50">{recipe.nutritionFacts.fiber}g</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* INSTRUCTIONS WITH TIMERS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-2xl text-forest-900 dark:text-cream-50">
              Cooking Instructions & Timers
            </h3>
            <span className="text-xs font-semibold text-stone-500">
              {completedSteps.length} of {recipe.instructions.length} steps completed
            </span>
          </div>

          <div className="space-y-4">
            {recipe.instructions.map((step) => {
              const isDone = completedSteps.includes(step.stepNumber);
              return (
                <div
                  key={step.stepNumber}
                  className={`p-6 rounded-3xl border transition-all ${
                    isDone
                      ? 'bg-forest-50/50 dark:bg-forest-950/30 border-forest-300 dark:border-forest-900 opacity-70'
                      : 'bg-white dark:bg-[#0e271f] border-stone-200 dark:border-forest-800 shadow-soft'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleStepComplete(step.stepNumber)}
                        className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition-colors ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-forest-900 text-gold-400 dark:bg-gold-500 dark:text-forest-950'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : step.stepNumber}
                      </button>
                      <h4 className="font-serif font-bold text-base text-forest-900 dark:text-cream-50">
                        {step.title || `Step ${step.stepNumber}`}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed mb-4">
                    {step.text}
                  </p>

                  {/* Interactive Timer if Step Has TimerMinutes */}
                  {step.timerMinutes > 0 && (
                    <div className="mt-3 max-w-sm">
                      <KitchenTimer
                        initialMinutes={step.timerMinutes}
                        stepTitle={`Step ${step.stepNumber} Countdown`}
                        onComplete={() => toast.success(`Step ${step.stepNumber} timer complete!`)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* REVIEWS & COMMUNITY RATINGS SECTION */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0e271f] border border-stone-200 dark:border-forest-800 shadow-soft space-y-6">
            <h3 className="font-serif font-bold text-xl text-forest-900 dark:text-cream-50">
              Community Ratings & Reviews ({recipe.ratingCount || 0})
            </h3>

            {/* Add Review Form */}
            <form onSubmit={handleReviewSubmit} className="p-4 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Your Rating:</span>
                <StarRating rating={myRating} size="md" interactive onRatingChange={setMyRating} />
              </div>

              <textarea
                rows={2}
                placeholder="Share your review, taste notes, or kitchen tips..."
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-forest-900 border border-stone-200 dark:border-forest-800 text-xs focus:outline-none focus:border-gold-500"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 font-bold text-xs shadow-xs hover:scale-105 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Review</span>
                </button>
              </div>
            </form>

            {/* Reviews Feed */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {recipe.ratings && recipe.ratings.length > 0 ? (
                recipe.ratings.map((r, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-stone-50/70 dark:bg-forest-950/40 border border-stone-200 dark:border-forest-900 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={r.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={r.user?.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-stone-900 dark:text-cream-50">{r.user?.name || 'Food Lover'}</span>
                      </div>
                      <StarRating rating={r.rating} size="xs" />
                    </div>
                    {r.comment && <p className="text-xs text-stone-600 dark:text-stone-300">{r.comment}</p>}
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500 italic text-center py-4">
                  No reviews yet. Be the first to try and review this recipe!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SIMILAR RECOMMENDED RECIPES */}
      {similarRecipes.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-stone-200 dark:border-forest-900">
          <h3 className="font-serif font-bold text-2xl text-forest-900 dark:text-cream-50">
            You Might Also Savor
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarRecipes.map((sim) => (
              <RecipeCard key={sim._id} recipe={sim} />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <BuyIngredientsModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        ingredients={recipe.ingredients}
        recipeTitle={recipe.title}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        recipe={recipe}
      />

      <ChefAssistantModal
        isOpen={isChefModalOpen}
        onClose={() => setIsChefModalOpen(false)}
        currentRecipe={recipe}
      />
    </div>
  );
};

export default RecipeDetail;
