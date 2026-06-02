import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import ImagePreview from './ImagePreview';
import EmojiInsertButton from '../common/EmojiInsertButton';
import { MAX_POST_TEXT_LENGTH } from '../../utils/constants';
import { validateImageFile } from '../../utils/validators';
import * as postApi from '../../api/postApi';

const EditPostDialog = ({ open, post, onClose, onUpdated, onError }) => {
  const fileInputRef = useRef(null);
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState('');

  const existingImageUrl = post?.image?.url && !removeImage && !previewUrl ? post.image.url : '';

  useEffect(() => {
    if (!open || !post) return;
    setText(post.text || '');
    setImageFile(null);
    setPreviewUrl('');
    setRemoveImage(false);
    setImageError('');
  }, [open, post]);

  const clearNewImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl('');
    setImageError('');
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) {
      setImageError(err);
      return;
    }
    setImageError('');
    setRemoveImage(false);
    clearNewImage();
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleRemoveExisting = () => {
    clearNewImage();
    setRemoveImage(true);
  };

  const canSave = text.trim().length > 0 || previewUrl || (existingImageUrl && !removeImage);

  const handleSave = async () => {
    if (!canSave || loading) return;

    const formData = new FormData();
    formData.append('text', text.trim());
    if (removeImage) formData.append('removeImage', 'true');
    if (imageFile) formData.append('image', imageFile);

    setLoading(true);
    try {
      const { data } = await postApi.updatePost(post._id, formData);
      onUpdated?.(data.data.post);
      onClose();
    } catch (err) {
      onError?.(err.message || 'Could not update post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle fontWeight={700}>Edit post</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={8}
          placeholder="Update your post..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          inputProps={{ maxLength: MAX_POST_TEXT_LENGTH }}
          className="create-post-textarea"
          sx={{ mt: 1 }}
        />

        {existingImageUrl && (
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Current image
            </Typography>
            <Box
              component="img"
              src={existingImageUrl}
              alt="Current"
              sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 2, mt: 1 }}
            />
            <Button size="small" color="error" onClick={handleRemoveExisting} sx={{ mt: 1 }}>
              Remove image
            </Button>
          </Box>
        )}

        {previewUrl && <ImagePreview previewUrl={previewUrl} onRemove={clearNewImage} />}

        {imageError && (
          <Typography variant="caption" color="error" display="block" mt={1}>
            {imageError}
          </Typography>
        )}

        <Box display="flex" alignItems="center" gap={0.5} mt={2}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={handleImageSelect}
          />
          <Button size="small" variant="outlined" onClick={() => fileInputRef.current?.click()}>
            {existingImageUrl || previewUrl ? 'Replace image' : 'Add image'}
          </Button>
          <EmojiInsertButton onEmojiSelect={(emoji) => setText((p) => p + emoji)} disabled={loading} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!canSave || loading}>
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPostDialog;
