import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

interface SearchBarProps {
  /** 搜索回调 */
  onSearch: (keyword: string) => void;
  /** 占位符文本 */
  placeholder?: string;
}

/**
 * 搜索输入框组件。
 * MUI TextField 搜索框，左侧搜索图标。
 * 输入时触发 onSearch 回调，支持清除按钮。
 */
function SearchBar({ onSearch, placeholder }: SearchBarProps): React.ReactElement {
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const newValue = event.target.value;
      setValue(newValue);
      onSearch(newValue);
    },
    [onSearch],
  );

  const handleClear = useCallback((): void => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <TextField
      value={value}
      onChange={handleChange}
      placeholder={placeholder ?? t('search.placeholder')}
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: 'text.secondary' }} />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear}>
              <ClearIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 3,
          bgcolor: 'background.paper',
        },
      }}
    />
  );
}

export default SearchBar;
