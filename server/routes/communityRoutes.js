const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const CommunityPost = require('../models/CommunityPost');
const { protect, optionalAuth } = require('../middleware/auth');

// @route   GET /api/communities
// @desc    Get all communities
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const communities = await Community.find(query)
      .populate('creator', 'name username avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      communities,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/communities/:id
// @desc    Get single community detail
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('creator', 'name username avatar')
      .populate('members', 'name username avatar');

    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    res.json({
      success: true,
      community,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/communities
// @desc    Create a new community
router.post('/', protect, async (req, res, next) => {
  try {
    const { name, description, category, image, banner, rules } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, message: 'Please provide name and description' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const exists = await Community.findOne({ $or: [{ name }, { slug }] });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Community with this name already exists' });
    }

    const community = await Community.create({
      name,
      slug,
      description,
      category: category || 'General Cooking',
      image: image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      banner: banner || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      creator: req.user._id,
      members: [req.user._id],
      rules: rules || [
        'Be respectful and kind to everyone.',
        'Share authentic recipes and techniques.',
        'No spam or excessive self-promotion.',
      ],
    });

    const populated = await Community.findById(community._id).populate('creator', 'name username avatar');

    res.status(201).json({
      success: true,
      community: populated,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/communities/:id/join
// @desc    Join or leave a community
router.post('/:id/join', protect, async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    const isMember = community.members.some((m) => m.toString() === req.user._id.toString());

    if (isMember) {
      community.members = community.members.filter((m) => m.toString() !== req.user._id.toString());
    } else {
      community.members.push(req.user._id);
    }

    await community.save();

    res.json({
      success: true,
      isMember: !isMember,
      memberCount: community.members.length,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/communities/:id/posts
// @desc    Get posts in a community
router.get('/:id/posts', optionalAuth, async (req, res, next) => {
  try {
    const posts = await CommunityPost.find({ community: req.params.id })
      .populate('author', 'name username avatar')
      .populate('sharedRecipe', 'title images cuisine prepTime cookTime category averageRating ratingCount')
      .populate('comments.author', 'name username avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      posts,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/communities/:id/posts
// @desc    Create post in community
router.post('/:id/posts', protect, async (req, res, next) => {
  try {
    const { title, content, image, sharedRecipe } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please provide post title and content' });
    }

    const post = await CommunityPost.create({
      community: req.params.id,
      author: req.user._id,
      title,
      content,
      image: image || '',
      sharedRecipe: sharedRecipe || null,
      likes: [],
      comments: [],
    });

    const populated = await CommunityPost.findById(post._id)
      .populate('author', 'name username avatar')
      .populate('sharedRecipe', 'title images cuisine prepTime cookTime category averageRating ratingCount');

    res.status(201).json({
      success: true,
      post: populated,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/communities/posts/:postId/like
// @desc    Toggle like on community post
router.post('/posts/:postId/like', protect, async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user._id;
    const isLiked = post.likes.some((id) => id.toString() === userId.toString());

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      liked: !isLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/communities/posts/:postId/comment
// @desc    Add comment to community post
router.post('/posts/:postId/comment', protect, async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const post = await CommunityPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.comments.push({
      author: req.user._id,
      content,
      createdAt: new Date(),
    });

    await post.save();

    const updated = await CommunityPost.findById(post._id)
      .populate('author', 'name username avatar')
      .populate('comments.author', 'name username avatar')
      .populate('sharedRecipe', 'title images cuisine prepTime cookTime category');

    res.json({
      success: true,
      comments: updated.comments,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
