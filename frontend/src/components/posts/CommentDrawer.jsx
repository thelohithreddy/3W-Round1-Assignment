import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import * as postApi from '../../api/postApi';
import { formatRelativeTime } from '../../utils/formatDate';
import { MAX_COMMENT_LENGTH } from '../../utils/constants';
import { validateComment } from '../../utils/validators';
import useAuth from '../../hooks/useAuth';
import UserIdentity from '../common/UserIdentity';
import EmojiInsertButton from '../common/EmojiInsertButton';
import { getColorFromUsername } from '../../utils/userDisplay';

const CommentDrawer = ({ open, post, onClose, onCommentAdded, onError }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !post?._id) return;

    const load = async () => {
      setLoading(true);
      try {
        const { data } = await postApi.getComments(post._id);
        setComments(data.data.comments);
      } catch (err) {
        setError(err.message);
        onError?.(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
    setText('');
    setError('');
  }, [open, post?._id]);

  const insertEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateComment(text);
    if (validationError) {
      setError(validationError);
      return;
    }

    const trimmed = text.trim();
    const optimistic = {
      _id: `temp-${Date.now()}`,
      user: user._id,
      username: user.username,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, optimistic]);
    const prevText = text;
    setText('');
    setSubmitting(true);
    setError('');

    try {
      const { data } = await postApi.addComment(post._id, trimmed);
      const newComment = data.data.comment;
      setComments((prev) =>
        prev.map((c) => (c._id === optimistic._id ? newComment : c))
      );
      onCommentAdded?.(post._id, data.data.commentsCount);
    } catch (err) {
      setComments((prev) => prev.filter((c) => c._id !== optimistic._id));
      setText(prevText);
      setError(err.message);
      onError?.(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getCommentAvatarColor = (comment) => {
    const commentUserId = comment.user?.toString?.() || comment.user;
    if (commentUserId === user?._id?.toString()) {
      return user.avatarColor;
    }
    return getColorFromUsername(comment.username);
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        className: 'comments-sheet-paper',
        sx: {
          maxHeight: '85vh',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxWidth: 580,
          mx: 'auto',
          left: 0,
          right: 0,
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" fontWeight={700}>
            Comments ({post?.commentsCount ?? comments.length})
          </Typography>
          <IconButton onClick={onClose} size="small" aria-label="Close comments">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ flex: 1, overflowY: 'auto', mb: 2, minHeight: 120 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={28} />
            </Box>
          ) : comments.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={3}>
              No comments yet. Be the first!
            </Typography>
          ) : (
            comments.map((c) => (
              <Box key={c._id} mb={2}>
                <UserIdentity
                  userId={c.user}
                  username={c.username}
                  avatarColor={getCommentAvatarColor(c)}
                  size="small"
                  subtitle={formatRelativeTime(c.createdAt)}
                />
                <Typography variant="body2" sx={{ mt: 0.5, ml: 6.5, whiteSpace: 'pre-wrap' }}>
                  {c.text}
                </Typography>
              </Box>
            ))
          )}
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          alignItems="flex-end"
          gap={0.5}
          sx={{ flexShrink: 0, pt: 1, borderTop: 1, borderColor: 'divider' }}
        >
          <EmojiInsertButton onEmojiSelect={insertEmoji} disabled={submitting} size="small" />
          <TextField
            fullWidth
            size="small"
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError('');
            }}
            inputProps={{ maxLength: MAX_COMMENT_LENGTH }}
            error={!!error}
            helperText={error || undefined}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 24 },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !text.trim()}
            sx={{ minWidth: 48, borderRadius: 24, px: 2, mb: error ? 2.5 : 0 }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default CommentDrawer;
