import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  text: { type: String, required: true, trim: true, maxlength: [500, 'Comment cannot exceed 500 characters'] },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorUsername: { type: String, required: true },
    authorAvatarColor: { type: String, default: '#1976d2' },
    text: { type: String, trim: true, default: '', maxlength: [2000, 'Post text cannot exceed 2000 characters'] },
    image: {
      url: { type: String, default: undefined },
      publicId: { type: String, default: undefined },
    },
    likes: [likeSchema],
    comments: [commentSchema],
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ 'likes.user': 1 });
postSchema.index({ 'comments.user': 1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
