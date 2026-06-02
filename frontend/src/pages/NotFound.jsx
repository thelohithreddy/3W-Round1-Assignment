import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

const NotFound = () => (
  <Box
    minHeight="100vh"
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    textAlign="center"
    px={3}
  >
    <Typography variant="h1" fontWeight={800} color="primary.main">
      404
    </Typography>
    <Typography variant="h5" fontWeight={600} gutterBottom>
      Page not found
    </Typography>
    <Typography color="text.secondary" mb={3}>
      The page you are looking for does not exist.
    </Typography>
    <Button component={RouterLink} to="/feed" variant="contained" size="large">
      Go to Feed
    </Button>
  </Box>
);

export default NotFound;
