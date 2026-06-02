import { Box, Dialog, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

const PostImageModal = ({
  open,
  imageUrl,
  isOwner,
  onClose,
  onEditRequest,
  onDeleteRequest,
}) => {
  if (!imageUrl) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: 'rgba(0,0,0,0.92)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2}
        py={1.5}
        sx={{ flexShrink: 0 }}
      >
        <IconButton onClick={onClose} sx={{ color: '#fff' }} aria-label="Close">
          <CloseIcon />
        </IconButton>
        {isOwner ? (
          <Box display="flex" gap={0.5}>
            <IconButton onClick={onEditRequest} sx={{ color: '#fff' }} aria-label="Edit post">
              <EditOutlinedIcon />
            </IconButton>
            <IconButton
              onClick={onDeleteRequest}
              sx={{ color: '#ff8a80' }}
              aria-label="Delete post"
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Box>
        ) : (
          <Box width={40} />
        )}
      </Box>

      <Box
        flex={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={2}
        pb={3}
        onClick={onClose}
        sx={{ cursor: 'pointer' }}
      >
        <Box
          component="img"
          src={imageUrl}
          alt="Post"
          onClick={(e) => e.stopPropagation()}
          sx={{
            maxWidth: '100%',
            maxHeight: '85vh',
            objectFit: 'contain',
            borderRadius: 1,
          }}
        />
      </Box>

      {isOwner && (
        <Typography
          variant="caption"
          textAlign="center"
          sx={{ color: 'rgba(255,255,255,0.6)', pb: 2 }}
        >
          Edit or delete from the toolbar above
        </Typography>
      )}
    </Dialog>
  );
};

export default PostImageModal;
