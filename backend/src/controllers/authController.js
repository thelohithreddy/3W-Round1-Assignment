import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import {
  getEmailValidationError,
  getPasswordValidationError,
  getUsernameValidationError,
  normalizeEmail,
  normalizeUsername,
} from '../utils/emailValidation.js';
import User from '../models/User.js';

const AVATAR_COLORS = [
  '#1976d2',
  '#9c27b0',
  '#2e7d32',
  '#ed6c02',
  '#d32f2f',
  '#0288d1',
  '#7b1fa2',
  '#c2185b',
];

const pickAvatarColor = () =>
  AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

const formatUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  avatarColor: user.avatarColor,
  followingCount: user.following?.length ?? 0,
  followersCount: user.followers?.length ?? 0,
  createdAt: user.createdAt,
});

// @route   POST /api/auth/signup
export const signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const usernameError = getUsernameValidationError(username);
  if (usernameError) {
    res.status(400);
    throw new Error(usernameError);
  }

  const normalizedEmail = normalizeEmail(email);
  const emailError = getEmailValidationError(email);
  if (emailError) {
    res.status(400);
    throw new Error(emailError);
  }

  const passwordError = getPasswordValidationError(password);
  if (passwordError) {
    res.status(400);
    throw new Error(passwordError);
  }

  const normalizedUsername = normalizeUsername(username);

  const [existingEmail, existingUsername] = await Promise.all([
    User.findOne({ email: normalizedEmail }),
    User.findOne({ username: normalizedUsername }),
  ]);

  if (existingEmail) {
    res.status(400);
    throw new Error('This email is already registered. Please log in instead.');
  }

  if (existingUsername) {
    res.status(400);
    throw new Error('This username is already taken. Please choose another one.');
  }

  const user = await User.create({
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    avatarColor: pickAvatarColor(),
  });

  res.status(201).json({
    success: true,
    data: {
      user: formatUser(user),
      token: generateToken(user._id),
    },
  });
});

// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email: loginId, password } = req.body;

  if (!loginId?.trim()) {
    res.status(400);
    throw new Error('Email or username is required');
  }

  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }

  const isEmailLogin = loginId.trim().includes('@');
  let user;

  if (isEmailLogin) {
    const normalizedEmail = normalizeEmail(loginId);
    const emailError = getEmailValidationError(loginId);
    if (emailError) {
      res.status(400);
      throw new Error(emailError);
    }
    user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      res.status(404);
      throw new Error('No account found with this email. Please sign up first.');
    }
  } else {
    const normalizedUsername = normalizeUsername(loginId);
    const usernameError = getUsernameValidationError(loginId);
    if (usernameError) {
      res.status(400);
      throw new Error(usernameError);
    }
    user = await User.findOne({ username: normalizedUsername }).select('+password');
    if (!user) {
      res.status(404);
      throw new Error('No account found with this username. Please sign up first.');
    }
  }

  if (!(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Incorrect password. Please try again.');
  }

  res.json({
    success: true,
    data: {
      user: formatUser(user),
      token: generateToken(user._id),
    },
  });
});

// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { user: formatUser(req.user) },
  });
});
