import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { communityAPI, recipeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import {
  Users,
  Plus,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  ArrowLeft,
  Utensils,
  Send,
  ShieldCheck,
} from 'lucide-react';

const CommunityDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Post Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [sharedRecipeId, setSharedRecipeId] = useState('');
  const [myRecipes, setMyRecipes] = useState([]);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Active Comment input map: postId -> commentText
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    fetchCommunityAndPosts();
    if (isAuthenticated) {
      loadMyRecipes();
    }
  }, [id, isAuthenticated]);

  const fetchCommunityAndPosts = async () => {
    try {
      setLoading(true);
      const [commRes, postRes] = await Promise.all([
        communityAPI.getById(id),
        communityAPI.getPosts(id),
      ]);
      setCommunity(commRes.data.community);
      setPosts(postRes.data.posts || []);
    } catch (err) {
      toast.error('Failed to load community details');
    } finally {
      setLoading(false);
    }
  };

  const loadMyRecipes = async () => {
    try {
      const res = await recipeAPI.getMyRecipes();
      setMyRecipes(res.data.recipes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikePost = async (postId) => {
    if (!isAuthenticated) {
      toast.info('Please log in to like posts');
      return;
    }
    try {
      const res = await communityAPI.toggleLikePost(postId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === postId) {
            const isLiked = res.data.liked;
            const updatedLikes = isLiked
              ? [...p.likes, user._id]
              : p.likes.filter((uid) => (typeof uid === 'string' ? uid : uid._id) !== user._id);
            return { ...p, likes: updatedLikes };
          }
          return p;
        })
      );
    } catch (err) {
      toast.error('Failed to like post');
    }
  };

  const handleCommentSubmit = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    if (!isAuthenticated) {
      toast.info('Please log in to comment');
      return;
    }

    try {
      const res = await communityAPI.commentPost(postId, { content: text.trim() });
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, comments: res.data.comments } : p))
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      toast.success('Comment posted!');
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    setIsSubmittingPost(true);
    try {
      const res = await communityAPI.createPost(id, {
        title: postTitle.trim(),
        content: postContent.trim(),
        sharedRecipe: sharedRecipeId || null,
      });
      setPosts([res.data.post, ...posts]);
      setIsPostModalOpen(false);
      setPostTitle('');
      setPostContent('');
      setSharedRecipeId('');
      toast.success('Post shared with community!');
    } catch (err) {
      toast.error(err.message || 'Failed to publish post');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  if (loading || !community) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-stone-500">
        Loading community discussions...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to="/community"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 dark:hover:text-cream-50"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>All Communities</span>
      </Link>

      {/* Community Banner Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-card border border-stone-200 dark:border-forest-800 bg-forest-950 text-white">
        <div className="h-52 w-full relative">
          <img
            src={community.banner || community.image}
            alt={community.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/60 to-transparent" />
        </div>

        <div className="p-6 sm:p-8 -mt-16 relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-gold-500 text-forest-950 shadow-xs">
                {community.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-cream-50 mt-2">
                {community.name}
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl mt-2 leading-relaxed">
                {community.description}
              </p>
            </div>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  toast.info('Please log in to post');
                  return;
                }
                setIsPostModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gold-500 hover:bg-gold-600 text-forest-950 font-bold text-xs shadow-md shrink-0 hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Post</span>
            </button>
          </div>
        </div>
      </div>

      {/* Community Rules & Discussion Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Rules Card (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0e271f] p-6 rounded-3xl border border-stone-200 dark:border-forest-800 shadow-soft space-y-4">
          <h3 className="font-serif font-bold text-base text-forest-900 dark:text-cream-50 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold-500" />
            <span>Community Rules</span>
          </h3>
          <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
            {community.rules?.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-gold-500 font-bold">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Posts Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="font-serif font-bold text-xl text-forest-900 dark:text-cream-50">
            Club Discussions ({posts.length})
          </h2>

          {posts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0e271f] border border-dashed border-stone-300 dark:border-forest-800 text-xs text-stone-500">
              No posts in this community yet. Be the first to share a recipe tip or question!
            </div>
          ) : (
            posts.map((post) => {
              const isPostLiked = user && post.likes?.some((uid) => (typeof uid === 'string' ? uid : uid._id) === user._id);
              return (
                <div
                  key={post._id}
                  className="p-6 rounded-3xl bg-white dark:bg-[#0e271f] border border-stone-200 dark:border-forest-800 shadow-soft space-y-4"
                >
                  {/* Author Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={post.author?.name}
                        className="w-9 h-9 rounded-2xl object-cover ring-2 ring-gold-500/50"
                      />
                      <div>
                        <p className="text-xs font-bold text-stone-900 dark:text-cream-50">{post.author?.name}</p>
                        <p className="text-[10px] text-stone-400">
                          {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-base text-forest-900 dark:text-cream-50">
                      {post.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed mt-1">
                      {post.content}
                    </p>
                  </div>

                  {/* Shared Recipe Attachment */}
                  {post.sharedRecipe && (
                    <Link
                      to={`/recipe/${post.sharedRecipe._id}`}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 hover:border-gold-500 transition-colors"
                    >
                      <img
                        src={post.sharedRecipe.images?.[0]}
                        alt={post.sharedRecipe.title}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-[10px] font-bold uppercase text-gold-600 dark:text-gold-400">Shared Recipe</p>
                        <p className="text-xs font-bold text-stone-900 dark:text-cream-50">{post.sharedRecipe.title}</p>
                      </div>
                    </Link>
                  )}

                  {/* Likes & Comments Count */}
                  <div className="flex items-center gap-4 pt-2 text-xs font-semibold text-stone-500">
                    <button
                      onClick={() => handleLikePost(post._id)}
                      className={`flex items-center gap-1 transition-colors ${
                        isPostLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isPostLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{post.likes?.length || 0} Likes</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments?.length || 0} Comments</span>
                    </div>
                  </div>

                  {/* Comments Thread */}
                  <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-forest-900">
                    {post.comments?.map((comment, cIdx) => (
                      <div key={cIdx} className="p-2.5 rounded-xl bg-stone-50/70 dark:bg-forest-950/40 text-xs flex items-start gap-2">
                        <img
                          src={comment.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={comment.author?.name}
                          className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-stone-900 dark:text-cream-50 mr-1.5">{comment.author?.name}:</span>
                          <span className="text-stone-700 dark:text-stone-300">{comment.content}</span>
                        </div>
                      </div>
                    ))}

                    {/* Comment Input Bar */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentInputs[post._id] || ''}
                        onChange={(e) =>
                          setCommentInputs({ ...commentInputs, [post._id]: e.target.value })
                        }
                        onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post._id)}
                        className="flex-1 px-3 py-2 rounded-xl bg-stone-50 dark:bg-forest-950 text-xs border border-stone-200 dark:border-forest-800 focus:outline-none focus:border-gold-500"
                      />
                      <button
                        onClick={() => handleCommentSubmit(post._id)}
                        className="p-2 rounded-xl bg-forest-900 text-gold-400 hover:bg-forest-800"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        title="Share with Community"
        subtitle={`Post to ${community.name}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Post Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. My secret trick for fluffy naans"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-xs focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Content *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Share your culinary tips, experiments, or ask a question..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-xs focus:outline-none focus:border-gold-500"
            />
          </div>

          {/* Attach Recipe Dropdown */}
          {myRecipes.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Attach One of Your Recipes (Optional)
              </label>
              <select
                value={sharedRecipeId}
                onChange={(e) => setSharedRecipeId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-forest-950 border border-stone-200 dark:border-forest-800 text-xs"
              >
                <option value="">None</option>
                {myRecipes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmittingPost}
            className="w-full py-3 rounded-2xl bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 font-bold text-xs sm:text-sm shadow-md hover:scale-[1.02] transition-all"
          >
            {isSubmittingPost ? 'Publishing...' : 'Publish Post'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default CommunityDetail;
