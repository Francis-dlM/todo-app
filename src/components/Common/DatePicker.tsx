import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Popover,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { dayjs } from '@/utils/date';

interface DatePickerProps {
  /** 当前值 */
  value: Date | null;
  /** 变更回调 */
  onChange: (date: Date | null) => void;
  /** 标签文字 */
  label: string;
  /** 是否显示时间选择 */
  showTime?: boolean;
}

/**
 * 日期选择器组件。
 * 封装 MUI DatePicker + 快捷选项（今天、明天、下周）。
 * 支持"清除日期"按钮。
 */
function DatePicker({ value, onChange, label, showTime = false }: DatePickerProps): React.ReactElement {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  /** 处理快捷日期选择 */
  const handleQuickSelect = (type: 'today' | 'tomorrow' | 'nextWeek'): void => {
    let date: Date;
    switch (type) {
      case 'today':
        date = dayjs().toDate();
        break;
      case 'tomorrow':
        date = dayjs().add(1, 'day').toDate();
        break;
      case 'nextWeek':
        date = dayjs().add(7, 'day').toDate();
        break;
    }
    onChange(date);
    setAnchorEl(null);
  };

  /** 处理清除日期 */
  const handleClear = (): void => {
    onChange(null);
  };

  /** 处理 DatePicker 变更 */
  const handleDateChange = (newValue: dayjs.Dayjs | null): void => {
    if (newValue) {
      onChange(newValue.toDate());
    } else {
      onChange(null);
    }
    setAnchorEl(null);
  };

  /** 格式化显示值 */
  const getDisplayValue = (): string => {
    if (!value) return label;
    if (showTime) {
      return dayjs(value).format('M月D日 HH:mm');
    }
    return dayjs(value).format('M月D日');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn">
      <Box sx={{ flex: 1 }}>
        <Button
          variant="text"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            textTransform: 'none',
            justifyContent: 'flex-start',
            px: 0,
            color: value ? 'text.primary' : 'text.secondary',
            fontSize: 14,
          }}
        >
          {getDisplayValue()}
        </Button>

        {value && (
          <IconButton size="small" onClick={handleClear} sx={{ ml: 0.5, p: 0.25 }}>
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        )}

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <Box sx={{ p: 2, minWidth: 280 }}>
            {/* 快捷选项 */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Button size="small" onClick={() => handleQuickSelect('today')}>
                {t('date.today')}
              </Button>
              <Button size="small" onClick={() => handleQuickSelect('tomorrow')}>
                {t('date.tomorrow')}
              </Button>
              <Button size="small" onClick={() => handleQuickSelect('nextWeek')}>
                {t('date.nextWeek')}
              </Button>
            </Stack>

            {/* 日历选择器 */}
            <MuiDatePicker
              value={value ? dayjs(value) : null}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                },
              }}
            />
          </Box>
        </Popover>
      </Box>
    </LocalizationProvider>
  );
}

export default DatePicker;
