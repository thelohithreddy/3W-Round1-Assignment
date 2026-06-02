import { Box, IconButton, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const FeedSearchBar = ({ value, onChange }) => {
  const hasValue = Boolean(value?.trim());

  return (
    <Box className="feed-search-row" sx={{ px: 2, pb: 1.5, pt: 0.5 }}>
      <Box
        className="feed-search-input-wrap"
        flex={1}
        display="flex"
        alignItems="center"
        px={0.5}
      >
        <SearchIcon sx={{ ml: 1, color: 'text.secondary', fontSize: 20 }} />
        <InputBase
          placeholder="Search posts or users..."
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          inputProps={{ 'aria-label': 'Search posts or users' }}
          sx={{ fontSize: '0.9rem', px: 1, py: 1, width: '100%' }}
        />

        {hasValue && (
          <IconButton
            size="small"
            aria-label="Clear search"
            onClick={() => onChange?.('')}
            sx={{ mr: 0.5 }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default FeedSearchBar;
