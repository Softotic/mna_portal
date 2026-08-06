import { Box, Typography } from '@mui/material';

export default function PageHeader({ title, description, actions }) {
  return (
    <Box
      component="header"
      sx={{
        mb: { xs: 2.5, md: 3 },
        display: 'flex',
        alignItems: { xs: 'stretch', sm: 'flex-start' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography component="h1" variant="h4" sx={{ textWrap: 'balance' }}>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 720, textWrap: 'pretty' }}>
            {description}
          </Typography>
        )}
      </Box>
      {actions && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flexShrink: 0 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
}

