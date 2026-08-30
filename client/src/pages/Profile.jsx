import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authAPI, recipeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RecipeCard from '../components/recipe/RecipeCard';
import Modal from '../components/common/Modal';
import {
  User,
  MapPin,
  Heart,
  Bookmark,
  Calendar,
  Settings,
  Plus,
  Trash2,
  Edit,
  UtensilsCrossed,
  ShieldCheck,
} from 'lucide-react';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, isAuthenticated, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isOwnProfile = !userId || (currentUser && currentUser._id === userId);
  const [profileUser, setProfileUser] = useState(null);
  const [myRecipes, setMyRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState('uploaded'); // 'uploaded' | 'saved'
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editLocation, setEditLocation] = useState('');

  useEffect(() => {
    if (!isAuthenticated && isOwnProfile) {
      navigate('/login');
      return;
    }
    loadProfileData();
  }, [userId, isAuthenticated, currentUser]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      if (isOwnProfile) {
        setProfileUser(currentUser);
        setEditName(currentUser.name || '');
        setEditBio(currentUser.bio || '');
        setEditAvatar(currentUser.avatar || '');
        setEditLocation(currentUser.location || '');

        const [myRes, savedRes] = await Promise.all([
          recipeAPI.getMyRecipes(),
          recipeAPI.getSaved(),
        ]);
        setMyRecipes(myRes.data.recipes || []);
        setSavedRecipes(savedRes.data.recipes || []);
      } else {
        const res = await authAPI.getUserProfile(userId);
        setProfileUser(res.data.user);
        setMyRecipes(res.data.recipes || []);
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const res = await updateUser({
      name: editName,
      bio: editBio,
      avatar: editAvatar,
      location: editLocation,
    });
    if (res.success) {
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      await recipeAPI.delete(recipeId);
      setMyRecipes((prev) => prev.filter((r) => r._id !== recipeId));
      toast.success('Recipe deleted');
    } catch (err) {
      toast.error('Failed to delete recipe');
    }
  };

  if (loading || !profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-stone-500">
        Loading culinary profile...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0e271f] border border-stone-200 dark:border-forest-800 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <img
              src={profileUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={profileUser.name}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-gold-500/50 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 dark:text-cream-50">
                  {profileUser.name}
                </h1>
                {profileUser.role === 'chef' && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gold-500 text-forest-950">
                    Master Chef
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-stone-400">@{profileUser.username}</p>
              {profileUser.location && (
                <p className="text-xs text-stone-500 flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gold-500" />
                  <span>{profileUser.location}</span>
                </p>
              )}
            </div>
          </div>

          {/* Action Button */}
          {isOwnProfile ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-stone-100 dark:bg-forest-900 hover:bg-stone-200 text-xs font-bold text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-forest-800 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <Link
                to="/recipe/new"
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gold-500 hover:bg-gold-600 text-forest-950 text-xs font-bold shadow-xs hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Recipe</span>
              </Link>
            </div>
          ) : (
            <Link
              to="/chat"
              className="px-5 py-2.5 rounded-2xl bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 font-bold text-xs shadow-xs"
            >
              Direct Message
            </Link>
          )}
        </div>

        {/* Bio & Dietary Preferences */}
        <div className="pt-4 border-t border-stone-100 dark:border-forest-900 space-y-3">
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed max-w-2xl">
            {profileUser.bio || 'Passionate foodie exploring recipes and culinary arts.'}
          </p>

          {profileUser.dietaryPreferences && profileUser.dietaryPreferences.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-stone-400 mr-1">Dietary Focus:</span>
              {profileUser.dietaryPreferences.map((d, i) => (
                <span
                  key={i}
                  className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-forest-100 dark:bg-forest-900 text-forest-900 dark:text-gold-300 border border-gold-500/30"
                >
                  {d}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-200 dark:border-forest-800 pb-2">
          <button
            onClick={() => setActiveTab('uploaded')}
            className={`flex items-center gap-2 pb-2 text-sm font-bold transition-all relative ${
              activeTab === 'uploaded'
                ? 'text-gold-600 dark:text-gold-400'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-cream-50'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Uploaded Recipes ({myRecipes.length})</span>
            {activeTab === 'uploaded' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500 rounded-full" />
            )}
          </button>

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 pb-2 text-sm font-bold transition-all relative ${
                activeTab === 'saved'
                  ? 'text-gold-600 dark:text-gold-400'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-cream-50'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved Favorites ({savedRecipes.length})</span>
              {activeTab === 'saved' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500 rounded-full" />
              )}
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'uploaded' ? (
          myRecipes.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0e271f] border border-dashed border-stone-200 dark:border-forest-800 space-y-3">
              <UtensilsCrossed className="w-10 h-10 text-stone-400 mx-auto" />
              <p className="text-xs text-stone-500">No recipes uploaded yet.</p>
              {isOwnProfile && (
                <Link
                  to="/recipe/new"
                  className="inline-block px-4 py-2 bg-gold-500 text-forest-950 text-xs font-bold rounded-xl shadow-xs"
                >
                  Upload Your First Recipe
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRecipes.map((recipe) => (
                <div key={recipe._id} className="relative group">
                  <RecipeCard recipe={recipe} />
                  {isOwnProfile && (
                    <div className="absolute top-3 right-12 z-20 flex items-center gap-1">
                      <Link
                        to={`/recipe/edit/${recipe._id}`}
                        className="p-1.5 rounded-full bg-white dark:bg-forest-900 text-stone-700 dark:text-stone-200 hover:text-gold-500 shadow-md"
                        title="Edit Recipe"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteRecipe(recipe._id)}
                        className="p-1.5 rounded-full bg-white dark:bg-forest-900 text-rose-600 shadow-md hover:bg-rose-50"
                        title="Delete Recipe"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          savedRecipes.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0e271f] border border-dashed border-stone-200 dark:border-forest-800 space-y-3">
              <Bookmark className="w-10 h-10 text-stone-400 mx-auto" />
              <p className="text-xs text-stone-500">You haven't saved any recipes yet.</p>
              <Link
                to="/explore"
                className="inline-block px-4 py-2 bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 text-xs font-bold rounded-xl"
              >
                Explore & Bookmark Recipes
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRecipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          )
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        subtitle="Update your chef bio, location, and photo"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-xs focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Bio
            </label>
            <textarea
              rows={3}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-xs focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={editAvatar}
              onChange={(e) => setEditAvatar(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-xs focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. Mumbai, India"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-xs focus:outline-none focus:border-gold-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 font-bold text-xs sm:text-sm shadow-md hover:scale-[1.02] transition-all"
          >
            Save Changes
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
