import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadPostImage, deletePostImage } from '../utils/imageStorage.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { MAX_COMMENT_LENGTH, MAX_POST_TEXT_LENGTH } from '../utils/constants.js';
import { pushNotification, notifyFollowersOfNewPost } from '../utils/notifyUser.js';
import { normalizePostImage } from '../utils/normalizeImage.js';

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const formatPost = (post, userId) => {
  const likes = post.likes || [];
  const comments = post.comments || [];
  const likedByMe = likes.some((l) => l.user.toString() === userId.toString());
  return {
    _id: post._id,
    author: post.author,
    authorUsername: post.authorUsername,
    authorAvatarColor: post.authorAvatarColor,
    text: post.text || '',
    image: normalizePostImage(post.image),
    likesCount: post.likesCount ?? likes.length,
    commentsCount: post.commentsCount ?? comments.length,
    likedByMe: post.likedByMe ?? likedByMe,
    followedByMe: Boolean(post.followedByMe),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

const formatAggregatedPost = (post) => ({
  _id: post._id,
  author: post.author,
  authorUsername: post.authorUsername,
  authorAvatarColor: post.authorAvatarColor,
  text: post.text || '',
  image: normalizePostImage(post.image),
  likesCount: post.likesCount,
  commentsCount: post.commentsCount,
  likedByMe: Boolean(post.likedByMe),
  followedByMe: Boolean(post.followedByMe),
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});

const getFollowingIds = async (userId) => {
  const user = await User.findById(userId).select('following');
  return (user?.following || []).map((f) => f.user);
};

export const fetchPaginatedPosts = async (userId, { match = {}, page, limit }) => {
  const skip = (page - 1) * limit;
  const uid = toObjectId(userId);
  const followingIds = await getFollowingIds(userId);

  const pipeline = [
    ...(Object.keys(match).length ? [{ $match: match }] : []),
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $addFields: {
        likesCount: { $size: { $ifNull: ['$likes', []] } },
        commentsCount: { $size: { $ifNull: ['$comments', []] } },
        likedByMe: { $in: [uid, '$likes.user'] },
        followedByMe: { $in: ['$author', followingIds] },
      },
    },
    {
      $project: {
        author: 1,
        authorUsername: 1,
        authorAvatarColor: 1,
        text: 1,
        image: 1,
        likesCount: 1,
        commentsCount: 1,
        likedByMe: 1,
        followedByMe: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];

  const [posts, total] = await Promise.all([
    Post.aggregate(pipeline),
    Post.countDocuments(match),
  ]);

  return {
    posts: posts.map(formatAggregatedPost),
    total,
    hasMore: skip + posts.length < total,
  };
};

// @route   POST /api/posts
export const createPost = asyncHandler(async (req, res) => {
  const text = req.body.text?.trim() || '';
  const hasImage = !!req.file;

  if (!text && !hasImage) {
    res.status(400);
    throw new Error('Post must contain text or an image');
  }

  if (text.length > MAX_POST_TEXT_LENGTH) {
    res.status(400);
    throw new Error(`Post text cannot exceed ${MAX_POST_TEXT_LENGTH} characters`);
  }

  let imageData;

  if (hasImage) {
    imageData = await uploadPostImage(req.file);
    if (!imageData?.url) {
      res.status(500);
      throw new Error('Image upload failed (no URL returned)');
    }
  }

  const postPayload = {
    author: req.user._id,
    authorUsername: req.user.username,
    authorAvatarColor: req.user.avatarColor,
    text,
  };

  if (imageData?.url) {
    postPayload.image = imageData;
  }

  const post = await Post.create(postPayload);

  const authorWithFollowers = await User.findById(req.user._id).select('username followers');
  if (authorWithFollowers) {
    await notifyFollowersOfNewPost(authorWithFollowers, post._id);
  }

  const formatted = formatPost(post, req.user._id);
  formatted.followedByMe = false;

  res.status(201).json({
    success: true,
    data: { post: formatted },
  });
});

// @route   GET /api/posts
export const getPosts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const { posts, total, hasMore } = await fetchPaginatedPosts(req.user._id, {
    page,
    limit,
  });

  res.json({
    success: true,
    data: {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore,
      },
    },
  });
});

const PROFILE_FILTERS = ['my', 'liked', 'commented'];

const buildProfileMatch = (filter, userId) => {
  const uid = toObjectId(userId);
  switch (filter) {
    case 'my':
      return { author: uid };
    case 'liked':
      return { 'likes.user': uid };
    case 'commented':
      return { 'comments.user': uid };
    default:
      return null;
  }
};

// @route   GET /api/posts/profile/counts
export const getProfileCounts = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [myPosts, liked, commented] = await Promise.all([
    Post.countDocuments({ author: userId }),
    Post.countDocuments({ 'likes.user': userId }),
    Post.countDocuments({ 'comments.user': userId }),
  ]);

  res.json({
    success: true,
    data: { myPosts, liked, commented },
  });
});

// @route   GET /api/posts/profile?filter=my|liked|commented
export const getProfilePosts = asyncHandler(async (req, res) => {
  const filter = req.query.filter || 'my';

  if (!PROFILE_FILTERS.includes(filter)) {
    res.status(400);
    throw new Error('Invalid filter. Use my, liked, or commented.');
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const match = buildProfileMatch(filter, req.user._id);

  const { posts, total, hasMore } = await fetchPaginatedPosts(req.user._id, {
    match,
    page,
    limit,
  });

  res.json({
    success: true,
    data: {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore,
      },
    },
  });
});

// @route   POST /api/posts/:postId/like
export const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const existingIndex = post.likes.findIndex(
    (l) => l.user.toString() === req.user._id.toString()
  );

  if (existingIndex >= 0) {
    post.likes.splice(existingIndex, 1);
  } else {
    post.likes.push({ user: req.user._id, username: req.user.username });
    if (post.author.toString() !== req.user._id.toString()) {
      await pushNotification(post.author, {
        type: 'like',
        fromUser: req.user._id,
        fromUsername: req.user.username,
        postId: post._id,
        message: `${req.user.username} liked your post`,
      });
    }
  }

  await post.save();

  const likedByMe = existingIndex < 0;

  res.json({
    success: true,
    data: {
      likesCount: post.likes.length,
      likedByMe,
    },
  });
});

// @route   POST /api/posts/:postId/comments
export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  const trimmed = text?.trim() || '';

  if (!trimmed) {
    res.status(400);
    throw new Error('Comment cannot be empty');
  }

  if (trimmed.length > MAX_COMMENT_LENGTH) {
    res.status(400);
    throw new Error(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`);
  }

  const post = await Post.findById(req.params.postId);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const comment = {
    user: req.user._id,
    username: req.user.username,
    text: trimmed,
    createdAt: new Date(),
  };

  post.comments.push(comment);
  await post.save();

  if (post.author.toString() !== req.user._id.toString()) {
    await pushNotification(post.author, {
      type: 'comment',
      fromUser: req.user._id,
      fromUsername: req.user.username,
      postId: post._id,
      message: `${req.user.username} commented on your post`,
    });
  }

  const savedComment = post.comments[post.comments.length - 1];

  res.status(201).json({
    success: true,
    data: {
      comment: {
        _id: savedComment._id,
        user: savedComment.user,
        username: savedComment.username,
        text: savedComment.text,
        createdAt: savedComment.createdAt,
      },
      commentsCount: post.comments.length,
    },
  });
});

// @route   GET /api/posts/:postId/comments
export const getComments = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId).select('comments');

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const comments = [...post.comments].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  res.json({
    success: true,
    data: {
      comments: comments.map((c) => ({
        _id: c._id,
        user: c.user,
        username: c.username,
        text: c.text,
        createdAt: c.createdAt,
      })),
    },
  });
});

// @route   PATCH /api/posts/:postId
export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to edit this post');
  }

  const text =
    req.body.text !== undefined ? String(req.body.text).trim() : (post.text || '');
  const removeImage =
    req.body.removeImage === 'true' || req.body.removeImage === true;
  const hasNewImage = !!req.file;

  let imageData = post.image?.url
    ? { url: post.image.url, publicId: post.image.publicId || '' }
    : null;

  if (removeImage && imageData?.publicId) {
    await deletePostImage(imageData.publicId);
    imageData = null;
  }

  if (hasNewImage) {
    if (imageData?.publicId) {
      await deletePostImage(imageData.publicId);
    }
    imageData = await uploadPostImage(req.file);
    if (!imageData?.url) {
      res.status(500);
      throw new Error('Image upload failed (no URL returned)');
    }
  }

  if (!text && !imageData?.url) {
    res.status(400);
    throw new Error('Post must contain text or an image');
  }

  if (text.length > MAX_POST_TEXT_LENGTH) {
    res.status(400);
    throw new Error(`Post text cannot exceed ${MAX_POST_TEXT_LENGTH} characters`);
  }

  post.text = text;
  post.image = imageData?.url ? imageData : undefined;
  await post.save();

  const followingIds = await getFollowingIds(req.user._id);
  const formatted = formatPost(post, req.user._id);
  formatted.followedByMe = followingIds.some(
    (id) => id.toString() === post.author.toString()
  );

  res.json({
    success: true,
    data: { post: formatted },
  });
});

// @route   DELETE /api/posts/:postId
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this post');
  }

  if (post.image?.publicId) {
    await deletePostImage(post.image.publicId);
  }

  await post.deleteOne();

  res.json({
    success: true,
    message: 'Post deleted successfully',
  });
});
