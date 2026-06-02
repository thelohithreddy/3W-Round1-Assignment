import { useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import ImagePreview from './ImagePreview';
import EmojiInsertButton from '../common/EmojiInsertButton';
import { MAX_POST_TEXT_LENGTH } from '../../utils/constants';
import { validateImageFile } from '../../utils/validators';
import * as postApi from '../../api/postApi';

const CreatePostCard = ({ onPostCreated, onError }) => {
  const fileInputRef = useRef(null);
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState('');

  const canPost = text.trim().length > 0 || !!imageFile;

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const err = validateImageFile(file);
    if (err) {
      setImageError(err);
      onError?.(err);
      return;
    }

    setImageError('');
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = '';
  };

  const removeImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl('');
    setImageError('');
  };

  const insertEmoji = (emoji) => {
    setText((prev) => prev + emoji);
  };

  const handleSubmit = async () => {
    if (!canPost || loading) return;

    if (text.trim().length > MAX_POST_TEXT_LENGTH) {
      onError?.(`Post text cannot exceed ${MAX_POST_TEXT_LENGTH} characters`);
      return;
    }

    const formData = new FormData();
    if (text.trim()) formData.append('text', text.trim());
    if (imageFile) formData.append('image', imageFile);

    setLoading(true);
    try {
      const { data } = await postApi.createPost(formData);
      onPostCreated?.(data.data.post);
      setText('');
      removeImage();
    } catch (err) {
      onError?.(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="create-post-card" sx={{ mb: 2 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="h6" fontWeight={800} mb={1.5}>
          Create Post
        </Typography>

        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={8}
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          variant="outlined"
          inputProps={{ maxLength: MAX_POST_TEXT_LENGTH }}
          className="create-post-textarea"
        />

        {imageError && (
          <Typography variant="caption" color="error" display="block" mt={0.5}>
            {imageError}
          </Typography>
        )}

        <ImagePreview previewUrl={previewUrl} onRemove={removeImage} />

        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mt={1.5}
          className="create-post-toolbar"
        >
          <Box display="flex" alignItems="center" gap={0.25}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              hidden
              onChange={handleImageSelect}
            />
            <IconButton
              className="toolbar-icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              aria-label="Add image"
            >
              <AddPhotoAlternateOutlinedIcon />
            </IconButton>
            <EmojiInsertButton onEmojiSelect={insertEmoji} disabled={loading} />
          </Box>
          <Button
            variant="contained"
            disabled={!canPost || loading}
            onClick={handleSubmit}
            className="create-post-submit"
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Post'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreatePostCard;
