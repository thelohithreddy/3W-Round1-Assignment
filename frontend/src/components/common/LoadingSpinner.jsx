import { Box, CircularProgress } from '@mui/material';

const LoadingSpinner = ({ size = 40, fullScreen = false }) => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    py={fullScreen ? 0 : 4}
    minHeight={fullScreen ? '60vh' : 'auto'}
  >
    <CircularProgress size={size} color="primary" />
  </Box>
);

export default LoadingSpinner;
