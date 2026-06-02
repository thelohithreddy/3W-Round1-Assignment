import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Snackbar } from '@mui/material';
import AppLayout from '../components/layout/AppLayout';
import CreatePostCard from '../components/posts/CreatePostCard';

const CreatePost = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showMessage = (message, severity = 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handlePostCreated = () => {
    showMessage('Post published!', 'success');
    setTimeout(() => navigate('/feed'), 600);
  };

  return (
    <AppLayout title="Create Post" showHeaderStats>
      <Box className="feed-scroll">
        <CreatePostCard onPostCreated={handlePostCreated} onError={(msg) => showMessage(msg, 'error')} />
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 10 }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
};

export default CreatePost;
