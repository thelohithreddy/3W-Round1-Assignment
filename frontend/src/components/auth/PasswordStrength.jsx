import { Box, LinearProgress, Typography } from '@mui/material';
import { getPasswordStrength } from '../../utils/validators';

const PasswordStrength = ({ password }) => {
  const { score, label, color } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <Box sx={{ mt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={(score / 6) * 100}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: 'grey.200',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
        }}
      />
      <Typography variant="caption" sx={{ color, fontWeight: 600, mt: 0.5, display: 'block' }}>
        Password strength: {label}
      </Typography>
    </Box>
  );
};

export default PasswordStrength;
