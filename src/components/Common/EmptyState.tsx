import React from 'react';
import { Box, Typography } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';

interface EmptyStateProps {
  /** 图标，默认 InboxIcon */
  icon?: React.ReactElement;
  /** 主文案 */
  title: string;
  /** 副文案 */
  description?: string;
}

/**
 * 空状态占位组件。
 * 居中展示图标 + 主文案 + 副文案。
 * 用于空清单、空搜索结果等场景。
 */
function EmptyState({ icon, title, description }: EmptyStateProps): React.ReactElement {
  return (
    <Box
      className="flex flex-col items-center justify-center"
      sx={{
        py: 8,
        px: 4,
        textAlign: 'center',
      }}
    >
      <Box sx={{ mb: 2, color: 'text.disabled' }}>
        {icon ?? <InboxIcon sx={{ fontSize: 64 }} />}
      </Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 500,
          color: 'text.secondary',
          mb: 1,
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          sx={{ color: 'text.disabled', maxWidth: 320 }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
}

export default EmptyState;
