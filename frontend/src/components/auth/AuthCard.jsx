import { Card, CardContent, Typography, Box } from '@mui/material';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';

const AuthCard = ({ title, subtitle, children }) => (
  <Card elevation={4} sx={{ borderRadius: 3 }}>
    <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
      <Box textAlign="center" mb={3}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <DynamicFeedIcon sx={{ color: '#fff', fontSize: 32 }} />
        </Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {children}
    </CardContent>
  </Card>
);

export default AuthCard;
