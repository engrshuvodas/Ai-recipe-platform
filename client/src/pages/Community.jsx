import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { communityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import {
  Users,
  Plus,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

const Community = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Create Community Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Regional Cooking');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCommunities();
  }, [selectedCategory]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      const res = await communityAPI.getAll(params);
      setCommunities(res.data.communities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinToggle = async (e, communityId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please log in to join food communities');
      return;
    }

    try {
      const res = await communityAPI.joinLeave(communityId);
      setCommunities((prev) =>
        prev.map((c) => {
          if (c._id === communityId) {
            const isNowMember = res.data.isMember;
            const updatedMembers = isNowMember
              ? [...(c.members || []), user._id]
              : (c.members || []).filter((m) => (typeof m === 'string' ? m : m._id) !== user._id);
            return { ...c, members: updatedMembers };
          }
          return c;
        })
      );
      toast.success(res.data.isMember ? 'Joined community club!' : 'Left community');
    } catch (err) {
      toast.error('Failed to update membership');
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      toast.error('Please enter name and description');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await communityAPI.create({
        name: name.trim(),
        description: description.trim(),
        category,
      });
      setCommunities([res.data.community, ...communities]);
      setIsCreateModalOpen(false);
      setName('');
      setDescription('');
      toast.success('Food community created successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to create community');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['All', 'Regional Indian', 'Bakery & Desserts', 'Healthy & Vegan', 'Quick Meals'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-forest-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100 dark:bg-forest-900/80 text-forest-900 dark:text-gold-300 text-xs font-bold mb-1">
            <Users className="w-3.5 h-3.5 text-gold-500" />
            <span>Culinary Circles & Home Chefs</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-forest-900 dark:text-cream-50">
            {t('communityTitle', 'Food Communities & Clubs')}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {t('communitySubtitle', 'Connect with home cooks, exchange culinary secrets, and share your food stories.')}
          </p>
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) {
              toast.info('Please log in to create a community');
              return;
            }
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 font-bold text-xs shadow-md hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('createCommunityBtn', 'Create Community')}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 shadow-sm'
                : 'bg-white dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Communities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-stone-200 dark:bg-forest-950 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((comm) => {
            const isMember = user && comm.members?.some((m) => (typeof m === 'string' ? m : m._id) === user._id);
            return (
              <div
                key={comm._id}
                className="group relative flex flex-col justify-between rounded-3xl overflow-hidden bg-white dark:bg-[#0e271f] border border-stone-200 dark:border-forest-800 shadow-soft hover:shadow-card transition-all"
              >
                <div className="h-36 relative overflow-hidden bg-forest-950">
                  <img
                    src={comm.banner || comm.image}
                    alt={comm.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <span className="absolute top-3 left-3 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-forest-900/90 text-gold-300 backdrop-blur-md">
                    {comm.category}
                  </span>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <Link to={`/community/${comm._id}`}>
                      <h3 className="font-serif font-bold text-lg text-forest-900 dark:text-cream-50 hover:text-gold-500 transition-colors line-clamp-1">
                        {comm.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                      {comm.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 dark:border-forest-900 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                      <Users className="w-3.5 h-3.5 text-gold-500" />
                      <span>{comm.members?.length || 1} Members</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleJoinToggle(e, comm._id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isMember
                            ? 'bg-stone-100 dark:bg-forest-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-forest-800'
                            : 'bg-gold-500 hover:bg-gold-600 text-forest-950 shadow-xs'
                        }`}
                      >
                        {isMember ? 'Joined' : 'Join Club'}
                      </button>
                      <Link
                        to={`/community/${comm._id}`}
                        className="p-1.5 rounded-xl bg-stone-100 dark:bg-forest-900 text-stone-700 dark:text-stone-200 hover:text-gold-500"
                        title="Enter Club"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Community Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Food Community"
        subtitle="Bring foodies together around a culinary passion"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateCommunity} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Community Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sourdough Masters & Wild Yeast"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-xs focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe the club purpose, topics, and recipe interests..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-xs focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-forest-950 border border-stone-200 dark:border-forest-800 text-xs"
            >
              {['Regional Indian', 'Bakery & Desserts', 'Healthy & Vegan', 'Quick Meals', 'Global Street Food', 'General Cooking'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 font-bold text-xs sm:text-sm shadow-md hover:scale-[1.02] transition-all"
          >
            {isSubmitting ? 'Creating...' : 'Create Community'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Community;
