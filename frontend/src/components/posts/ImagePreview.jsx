import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ImagePreview = ({ previewUrl, onRemove }) => {
  if (!previewUrl) return null;

  return (
    <Box sx={{ mt: 1.5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          Selected image
        </Typography>
        <Typography
          variant="caption"
          color="error"
          sx={{ cursor: 'pointer', fontWeight: 600 }}
          onClick={onRemove}
        >
          Remove
        </Typography>
      </Box>
      <Box position="relative" display="inline-block">
        <Box
          component="img"
          src={previewUrl}
          alt="Preview"
          sx={{
            width: 80,
            height: 80,
            objectFit: 'cover',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        />
        <IconButton
          size="small"
          onClick={onRemove}
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            bgcolor: 'error.main',
            color: '#fff',
            width: 22,
            height: 22,
            '&:hover': { bgcolor: 'error.dark' },
          }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ImagePreview;
