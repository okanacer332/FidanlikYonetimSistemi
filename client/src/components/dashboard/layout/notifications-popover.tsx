import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { Package as PackageIcon, Warning as WarningIcon } from '@phosphor-icons/react';
import { Divider } from '@mui/material';

export interface Notification {
  id: string;
  type: 'low_stock' | 'new_order';
  message: string;
}

interface NotificationsPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
  notifications: Notification[];
}

export function NotificationsPopover({ anchorEl, onClose, open, notifications = [] }: NotificationsPopoverProps): React.JSX.Element {
  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '380px', maxWidth: '100%' } } }}
    >
      <Box sx={{ p: '16px 20px ' }}>
        <Typography variant="h6">Bildirimler</Typography>
      </Box>
      <Divider />
      {notifications.length === 0 ? (
        <Box sx={{ p: 2 }}>
            <Typography color="text.secondary" variant="body2">Yeni bildirim bulunmamaktadır.</Typography>
        </Box>
      ) : (
        <List sx={{ p: 1 }}>
          {notifications.map((notification) => (
            <ListItem key={notification.id} sx={{borderRadius: 1, '&:hover': {bgcolor: 'action.hover'} }}>
              <ListItemIcon>
                {notification.type === 'new_order' && <PackageIcon style={{ color: 'var(--mui-palette-info-main)'}} />}
                {notification.type === 'low_stock' && <WarningIcon style={{ color: 'var(--mui-palette-warning-main)'}} />}
              </ListItemIcon>
              <ListItemText primary={notification.message} primaryTypographyProps={{variant: 'body2'}} />
            </ListItem>
          ))}
        </List>
      )}
    </Popover>
  );
}