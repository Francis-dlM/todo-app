import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { WbSunny as WbSunnyIcon } from '@mui/icons-material';
import { dayjs } from '@/utils/date';

/**
 * "我的一天"页面头部。
 * 显示当天日期（大字）+ 星期 + 欢迎语。
 * 背景渐变色（蓝色系）。
 */
function MyDayHeader(): React.ReactElement {
  const { t } = useTranslation();

  /** 获取时间段问候语 */
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t('myDay.greeting.morning');
    if (hour < 18) return t('myDay.greeting.afternoon');
    return t('myDay.greeting.evening');
  };

  /** 获取星期几 */
  const getWeekday = (): string => {
    return dayjs().format('dddd');
  };

  /** 获取日期显示 */
  const getDateDisplay = (): string => {
    return dayjs().format('M月D日');
  };

  return (
    <Box
      sx={{
        px: 3,
        py: 3,
        mb: 2,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #0078D4 0%, #4DA6E8 100%)',
        color: 'white',
      }}
    >
      <Box className="flex items-center gap-2 mb-2">
        <WbSunnyIcon sx={{ fontSize: 32 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
          {t('myDay.today')}
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.95)', mb: 0.5 }}>
        {getDateDisplay()} {getWeekday()}
      </Typography>
      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
        {getGreeting()}
      </Typography>
    </Box>
  );
}

export default MyDayHeader;
