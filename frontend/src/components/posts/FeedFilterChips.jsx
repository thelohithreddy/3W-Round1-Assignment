import { Box, Chip } from '@mui/material';

const FILTERS = ['All Post', 'For You', 'Most Liked', 'Most Commented'];

const FeedFilterChips = ({ active = 0, onChange }) => (
  <Box className="feed-filter-chips" sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1.5 }}>
    {FILTERS.map((label, index) => (
      <Chip
        key={label}
        label={label}
        onClick={() => onChange?.(index)}
        className={active === index ? 'filter-chip-active' : 'filter-chip'}
        sx={{ flexShrink: 0, fontWeight: 600 }}
      />
    ))}
  </Box>
);

export default FeedFilterChips;
