import express from 'express';
import {
  toggleFollow,
  getFollowSuggestions,
  getFollowers,
  getFollowing,
  getNotifications,
  markNotificationsRead,
  getUserProfile,
  getUserPosts,
  getUserFollowersById,
  getUserFollowingById,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/notifications', getNotifications);
router.patch('/notifications/read', markNotificationsRead);
router.get('/followers', getFollowers);
router.get('/following', getFollowing);
router.get('/suggestions', getFollowSuggestions);
router.get('/:userId/posts', getUserPosts);
router.get('/:userId/followers', getUserFollowersById);
router.get('/:userId/following', getUserFollowingById);
router.get('/:userId', getUserProfile);
router.post('/:userId/follow', toggleFollow);

export default router;
