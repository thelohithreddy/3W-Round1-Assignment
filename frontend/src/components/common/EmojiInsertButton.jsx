import { useRef, useState } from 'react';
import { ClickAwayListener, IconButton, Popover, Box } from '@mui/material';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import EmojiPicker from 'emoji-picker-react';
import useThemeMode from '../../hooks/useThemeMode';

const EmojiInsertButton = ({ onEmojiSelect, disabled = false, size = 'medium' }) => {
  const { mode } = useThemeMode();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleEmojiClick = (emojiData) => {
    onEmojiSelect?.(emojiData.emoji);
    setOpen(false);
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        className="toolbar-icon"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-label="Insert emoji"
        size={size}
      >
        <EmojiEmotionsOutlinedIcon />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: { overflow: 'hidden', borderRadius: 2 },
          },
        }}
      >
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Box>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={mode === 'dark' ? 'dark' : 'light'}
              width={320}
              height={380}
              searchPlaceHolder="Search emoji"
              previewConfig={{ showPreview: false }}
            />
          </Box>
        </ClickAwayListener>
      </Popover>
    </>
  );
};

export default EmojiInsertButton;
