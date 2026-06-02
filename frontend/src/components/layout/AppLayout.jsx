import { Box } from '@mui/material';
import Header from './Header';
import BottomNav from './BottomNav';
import FeedSearchBar from './FeedSearchBar';

const AppLayout = ({
  children,
  title = 'Social',
  hideBottomNav = false,
  showSearch = false,
  searchValue,
  onSearchChange,
  showHeaderStats = true,
}) => (
  <div className="app-shell">
    <div className="app-container">
      <Header title={title} showStats={showHeaderStats} />
      {showSearch && (
        <FeedSearchBar value={searchValue} onChange={onSearchChange} />
      )}
      <Box component="main" className="app-main">
        {children}
      </Box>
      {!hideBottomNav && <BottomNav />}
    </div>
  </div>
);

export default AppLayout;
