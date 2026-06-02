import express from 'express';
import {
  createPost,
  getPosts,
  getProfilePosts,
  getProfileCounts,
  toggleLike,
  addComment,
  getComments,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import { postLimiter } from '../middleware/rateLimitMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(postLimiter);

const handleUpload = (req, res, next) => {
  uploadSingleImage(req, res, (err) => {
    if (err) {
      res.status(400);
      next(new Error(err.message || 'Image upload failed'));
      return;
    }
    next();
  });
};

router.route('/').get(getPosts).post(handleUpload, createPost);

router.get('/profile/counts', getProfileCounts);
router.get('/profile', getProfilePosts);

router.route('/:postId/like').post(toggleLike);
router.route('/:postId/comments').get(getComments).post(addComment);
router.route('/:postId').patch(handleUpload, updatePost).delete(deletePost);

export default router;
