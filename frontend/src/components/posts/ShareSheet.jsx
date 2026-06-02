import {
  Box,
  Button,
  Drawer,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import { getPostShareUrl } from '../../utils/userDisplay';
import { getPostImageUrl } from '../../utils/imageUrl';

const ShareSheet = ({ open, post, onClose, onSuccess, onError }) => {
  const shareUrl = post?._id ? getPostShareUrl(post._id) : '';
  const previewText = post?.text?.trim() || 'Check out this post';
  const previewImage = getPostImageUrl(post?.image);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      onSuccess?.('Link copied to clipboard');
      onClose();
    } catch {
      onError?.('Could not copy link');
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      handleCopy();
      return;
    }
    try {
      await navigator.share({
        title: 'Social Post',
        text: previewText,
        url: shareUrl,
      });
      onSuccess?.('Shared successfully');
      onClose();
    } catch (err) {
      if (err?.name !== 'AbortError') {
        onError?.(err.message || 'Share cancelled');
      }
    }
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        className: 'share-sheet-paper',
        sx: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxWidth: 520,
          mx: 'auto',
          left: 0,
          right: 0,
        },
      }}
    >
      <Box sx={{ p: 2.5, pb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700}>
            Share Post
          </Typography>
          <IconButton onClick={onClose} size="small" aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          className="share-preview"
          sx={{
            p: 1.5,
            mb: 2,
            borderRadius: 2,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {previewImage && (
            <Box
              component="img"
              src={previewImage}
              alt=""
              sx={{
                width: '100%',
                maxHeight: 120,
                objectFit: 'cover',
                borderRadius: 1.5,
                mb: post?.text ? 1 : 0,
              }}
            />
          )}
          {post?.text && (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {post.text.length > 120 ? `${post.text.slice(0, 120)}…` : post.text}
            </Typography>
          )}
          {!post?.text && !post?.image?.url && (
            <Typography variant="body2" color="text.secondary">
              Post preview
            </Typography>
          )}
        </Box>

        <Box display="flex" flexDirection="column" gap={1}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<ShareIcon />}
            onClick={handleNativeShare}
            sx={{ borderRadius: 2, py: 1.25 }}
          >
            {navigator.share ? 'Share via…' : 'Copy link'}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
            sx={{ borderRadius: 2, py: 1.25 }}
          >
            Copy link
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ShareSheet;
