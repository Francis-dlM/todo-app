import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, IconButton } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useMyDayStore } from '@/stores/myDayStore';
import { formatRelativeDate, isOverdue } from '@/utils/date';

/**
 * 智能推荐面板。
 * 当"我的一天"为空时显示，列出建议任务（逾期+今日截止）。
 * 每项可点击"添加到我的一天"。
 */
function SmartSuggestion(): React.ReactElement {
  const { t } = useTranslation();
  const suggestions = useMyDayStore((state) => state.suggestions);
  const addToMyDay = useMyDayStore((state) => state.addToMyDay);

  if (suggestions.length === 0) {
    return <></>;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
        {t('myDay.suggestions')}
      </Typography>

      {suggestions.slice(0, 5).map((task) => (
        <Box
          key={task.id}
          className="flex items-center justify-between"
          sx={{
            py: 1.5,
            px: 2,
            mb: 0.5,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: 1,
            borderColor: task.dueDate && isOverdue(task.dueDate) ? 'error.light' : 'divider',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 500,
              }}
            >
              {task.title}
            </Typography>
            {task.dueDate && (
              <Typography
                variant="caption"
                sx={{
                  color: isOverdue(task.dueDate) ? 'error.main' : 'text.secondary',
                }}
              >
                {isOverdue(task.dueDate)
                  ? t('date.overdue')
                  : formatRelativeDate(task.dueDate)}
              </Typography>
            )}
          </Box>
          <IconButton
            size="small"
            onClick={() => addToMyDay(task.id)}
            sx={{ ml: 1 }}
          >
            <AddIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
}

export default SmartSuggestion;
