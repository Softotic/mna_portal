import { Chip } from '@mui/material';

import { getSchemeStatus } from '../constants/schemeStatus';

export default function SchemeStatusChip({ status }) {
  const statusMeta = getSchemeStatus(status);

  return (
    <Chip
      size="small"
      label={statusMeta.label}
      aria-label={`Scheme status: ${statusMeta.label}`}
      sx={{
        height: 28,
        maxWidth: 230,
        bgcolor: statusMeta.backgroundColor,
        color: statusMeta.textColor,
        border: `1px solid ${statusMeta.color}59`,
        fontWeight: 700,
        '&::before': {
          content: '""',
          width: 8,
          height: 8,
          flexShrink: 0,
          ml: 1.1,
          borderRadius: '50%',
          bgcolor: statusMeta.color,
        },
        '& .MuiChip-label': {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          px: 1,
        },
      }}
    />
  );
}
