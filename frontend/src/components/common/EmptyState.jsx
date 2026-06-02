import { Box, Typography } from '@mui/material';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';

const EmptyState = ({
  title = 'No posts yet',
  message = 'Be the first to share something with the community!',
  icon: Icon = FeedOutlinedIcon,
}) => (
  <Box
    textAlign="center"
    py={6}
    px={3}
    sx={{
      bgcolor: 'background.paper',
      borderRadius: 3,
      border: '1px dashed',
      borderColor: 'divider',
    }}
  >
    <Icon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
    <Typography variant="h6" fontWeight={600} gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

export default EmptyState;
