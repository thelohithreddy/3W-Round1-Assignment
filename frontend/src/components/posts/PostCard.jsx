import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import * as userApi from '../../api/userApi';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { formatFeedTimestamp } from '../../utils/formatDate';
import useAuth from '../../hooks/useAuth';
import * as postApi from '../../api/postApi';
import UserIdentity from '../common/UserIdentity';
import CommentDrawer from './CommentDrawer';
import ConfirmDialog from '../common/ConfirmDialog';
import ShareSheet from './ShareSheet';
import PostImageModal from './PostImageModal';
import EditPostDialog from './EditPostDialog';
import { getPostImageUrl } from '../../utils/imageUrl';

const PostCard = ({
  post,
  onLikeUpdate,
  onCommentUpdate,
  onPostUpdate,
  onDelete,
  onError,
  onSuccess,
  onFollowUpdate,
}) => {
  const { user } = useAuth();
  const [localPost, setLocalPost] = useState(post);
  const [followed, setFollowed] = useState(Boolean(post.followedByMe));
  const [followLoading, setFollowLoading] = useState(false);
  const [liked, setLiked] = useState(post.likedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);

  const imageUrl = getPostImageUrl(localPost.image);
  const authorId = localPost.author?.toString?.() || localPost.author;
  const isOwner = authorId && user?._id && authorId === user._id.toString();

  useEffect(() => {
    setLocalPost(post);
    setFollowed(Boolean(post.followedByMe));
    setLiked(post.likedByMe);
    setLikesCount(post.likesCount);
    setCommentsCount(post.commentsCount);
  }, [post]);

  useEffect(() => {
    setImageBroken(false);
  }, [localPost._id, imageUrl]);

  const handleFollow = async () => {
    if (!authorId || followLoading || isOwner) return;

    const prev = followed;
    setFollowed(!prev);
    setFollowLoading(true);

    try {
      const { data } = await userApi.toggleFollow(authorId);
      setFollowed(data.data.following);
      onFollowUpdate?.(authorId, data.data);
    } catch (err) {
      setFollowed(prev);
      onError?.(err.message || 'Could not update follow');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleLike = async () => {
    const prevLiked = liked;
    const prevCount = likesCount;

    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);
    setLikeLoading(true);

    try {
      const { data } = await postApi.toggleLike(localPost._id);
      setLiked(data.data.likedByMe);
      setLikesCount(data.data.likesCount);
      onLikeUpdate?.(localPost._id, data.data);
    } catch (err) {
      setLiked(prevLiked);
      setLikesCount(prevCount);
      onError?.(err.message || 'Could not update like');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCommentAdded = (postId, count) => {
    setCommentsCount(count);
    onCommentUpdate?.(postId, { commentsCount: count });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await postApi.deletePost(localPost._id);
      onDelete?.(localPost._id);
      setDeleteOpen(false);
      setImageModalOpen(false);
      onSuccess?.('Post deleted');
    } catch (err) {
      setDeleteOpen(false);
      onError?.(err.message || 'Could not delete post');
    } finally {
      setDeleting(false);
    }
  };

  const handlePostUpdated = (updated) => {
    setLocalPost(updated);
    onPostUpdate?.(localPost._id, updated);
    onSuccess?.('Post updated');
  };

  const openEdit = () => {
    setMenuAnchor(null);
    setImageModalOpen(false);
    setEditOpen(true);
  };

  const openDeleteConfirm = () => {
    setMenuAnchor(null);
    setImageModalOpen(false);
    setDeleteOpen(true);
  };

  return (
    <>
      <Card className="post-card post-enter" sx={{ mb: 1.5 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box
            className="post-card-header"
            display="flex"
            alignItems="flex-start"
            gap={1}
            mb={1.5}
          >
            <Box flex={1} minWidth={0}>
              <UserIdentity
                userId={authorId}
                username={localPost.authorUsername}
                avatarColor={localPost.authorAvatarColor}
                size="large"
                subtitle={formatFeedTimestamp(localPost.createdAt)}
              />
            </Box>

            <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
              {!isOwner ? (
                <Button
                  size="small"
                  variant={followed ? 'outlined' : 'contained'}
                  color="primary"
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`post-follow-btn${followed ? ' post-follow-btn--following' : ''}`}
                >
                  {followLoading ? '...' : followed ? 'Following' : 'Follow'}
                </Button>
              ) : (
                <Typography
                  variant="caption"
                  sx={{
                    px: 1.25,
                    py: 0.35,
                    borderRadius: 10,
                    bgcolor: 'primary.main',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                >
                  You
                </Typography>
              )}
              {isOwner && (
                <>
                  <IconButton
                    size="small"
                    onClick={(e) => setMenuAnchor(e.currentTarget)}
                    aria-label="Post options"
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={() => setMenuAnchor(null)}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <MenuItem onClick={openEdit}>
                      <ListItemIcon>
                        <EditOutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Edit post" />
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={openDeleteConfirm}>
                      <ListItemIcon>
                        <DeleteOutlineIcon fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText primary="Delete post" sx={{ color: 'error.main' }} />
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Box>

          {localPost.text && (
            <Typography variant="body1" sx={{ mb: imageUrl && !imageBroken ? 1.5 : 0, whiteSpace: 'pre-wrap' }}>
              {localPost.text}
            </Typography>
          )}

          {imageUrl && !imageBroken && (
            <Box
              component="img"
              src={imageUrl}
              alt="Post image"
              className="post-image"
              sx={{ mb: 1.5 }}
              onClick={() => setImageModalOpen(true)}
              onError={() => setImageBroken(true)}
            />
          )}
          {imageUrl && imageBroken && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
              Image unavailable — delete this post and upload again after restarting the backend.
            </Typography>
          )}

          <Box className="post-actions" display="flex" alignItems="center" gap={2.5} pt={1}>
            <Box display="flex" alignItems="center" gap={0.25}>
              <IconButton
                onClick={handleLike}
                disabled={likeLoading}
                size="small"
                color={liked ? 'error' : 'default'}
                aria-label="Like"
              >
                {liked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
              </IconButton>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {likesCount}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.25}>
              <IconButton
                size="small"
                onClick={() => setCommentsOpen(true)}
                aria-label="Comments"
              >
                <ChatBubbleOutlineIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {commentsCount}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.25}>
              <IconButton size="small" onClick={() => setShareOpen(true)} aria-label="Share">
                <ShareOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <CommentDrawer
        open={commentsOpen}
        post={{ ...localPost, commentsCount }}
        onClose={() => setCommentsOpen(false)}
        onCommentAdded={handleCommentAdded}
        onError={onError}
      />

      <ShareSheet
        open={shareOpen}
        post={localPost}
        onClose={() => setShareOpen(false)}
        onSuccess={onSuccess}
        onError={onError}
      />

      <PostImageModal
        open={imageModalOpen}
        imageUrl={imageUrl}
        isOwner={isOwner}
        onClose={() => setImageModalOpen(false)}
        onEditRequest={openEdit}
        onDeleteRequest={openDeleteConfirm}
      />

      <EditPostDialog
        open={editOpen}
        post={localPost}
        onClose={() => setEditOpen(false)}
        onUpdated={handlePostUpdated}
        onError={onError}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete post?"
        message="This action cannot be undone. Your post and image will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={deleting}
      />
    </>
  );
};

export default PostCard;
