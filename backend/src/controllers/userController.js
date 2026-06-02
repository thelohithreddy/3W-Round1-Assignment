import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { pushNotification } from '../utils/notifyUser.js';
import { fetchPaginatedPosts } from './postController.js';

const formatPublicUser = (user) => ({
  _id: user._id,
  username: user.username,
  avatarColor: user.avatarColor,
  followersCount: user.followers?.length ?? 0,
  followingCount: user.following?.length ?? 0,
});

const formatFollowEntry = (entry) => ({
  _id: entry.user,
  username: entry.username,
});

// @route   POST /api/users/:userId/follow
export const toggleFollow = asyncHandler(async (req, res) => {
  const targetId = req.params.userId;

  if (targetId === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot follow yourself');
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(req.user._id),
    User.findById(targetId),
  ]);

  if (!targetUser) {
    res.status(404);
    throw new Error('User not found');
  }

  const existingIndex = currentUser.following.findIndex(
    (f) => f.user.toString() === targetId
  );

  if (existingIndex >= 0) {
    currentUser.following.splice(existingIndex, 1);
    targetUser.followers = targetUser.followers.filter(
      (f) => f.user.toString() !== currentUser._id.toString()
    );
  } else {
    currentUser.following.push({
      user: targetUser._id,
      username: targetUser.username,
    });
    const alreadyFollower = targetUser.followers.some(
      (f) => f.user.toString() === currentUser._id.toString()
    );
    if (!alreadyFollower) {
      targetUser.followers.push({
        user: currentUser._id,
        username: currentUser.username,
      });
      await pushNotification(targetUser._id, {
        type: 'follow',
        fromUser: currentUser._id,
        fromUsername: currentUser.username,
        message: `${currentUser.username} started following you`,
      });
    }
  }

  await Promise.all([currentUser.save(), targetUser.save()]);

  const isFollowing = existingIndex < 0;

  res.json({
    success: true,
    data: {
      following: isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length,
    },
  });
});

// @route   GET /api/users/:userId
export const getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId).select(
    'username email avatarColor followers following createdAt'
  );

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isSelf = user._id.toString() === req.user._id.toString();
  const followedByMe = (user.followers || []).some(
    (f) => f.user.toString() === req.user._id.toString()
  );
  const postsCount = await Post.countDocuments({ author: user._id });

  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        username: user.username,
        avatarColor: user.avatarColor,
        followersCount: user.followers?.length ?? 0,
        followingCount: user.following?.length ?? 0,
        postsCount,
        followedByMe,
        isSelf,
        createdAt: user.createdAt,
        ...(isSelf ? { email: user.email } : {}),
      },
    },
  });
});

// @route   GET /api/users/:userId/posts
export const getUserPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId).select('username avatarColor');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const { posts, total, hasMore } = await fetchPaginatedPosts(req.user._id, {
    match: { author: new mongoose.Types.ObjectId(userId) },
    page,
    limit,
  });

  res.json({
    success: true,
    data: {
      user: formatPublicUser(user),
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

// @route   GET /api/users/suggestions
export const getFollowSuggestions = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id).select('following');
  const followingIds = (currentUser.following || []).map((f) => f.user);
  followingIds.push(req.user._id);

  const users = await User.find({ _id: { $nin: followingIds } })
    .select('username avatarColor followers')
    .limit(8)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      users: users.map((u) => ({
        ...formatPublicUser(u),
        followedByMe: false,
      })),
    },
  });
});

// @route   GET /api/users/followers
export const getFollowers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('followers');
  const followers = user?.followers || [];

  res.json({
    success: true,
    data: { users: followers.map(formatFollowEntry) },
  });
});

// @route   GET /api/users/following
export const getFollowing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('following');
  const following = user?.following || [];

  res.json({
    success: true,
    data: { users: following.map(formatFollowEntry) },
  });
});

// @route   GET /api/users/:userId/followers
export const getUserFollowersById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('followers');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({
    success: true,
    data: { users: (user.followers || []).map(formatFollowEntry) },
  });
});

// @route   GET /api/users/:userId/following
export const getUserFollowingById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('following');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({
    success: true,
    data: { users: (user.following || []).map(formatFollowEntry) },
  });
});

// @route   GET /api/users/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('notifications');
  const notifications = [...(user?.notifications || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  res.json({
    success: true,
    data: {
      notifications: notifications.map((n) => ({
        _id: n._id,
        type: n.type,
        fromUser: n.fromUser,
        fromUsername: n.fromUsername,
        postId: n.postId,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
      })),
      unreadCount,
    },
  });
});

// @route   PATCH /api/users/notifications/read
export const markNotificationsRead = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('notifications');
  if (user?.notifications?.length) {
    user.notifications.forEach((n) => {
      n.read = true;
    });
    await user.save();
  }

  res.json({ success: true, data: { unreadCount: 0 } });
});
