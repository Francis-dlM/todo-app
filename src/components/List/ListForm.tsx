import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField, IconButton } from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useListStore } from '@/stores/listStore';
import { LIST_COLORS } from '@/utils/constants';
import type { CreateListInput } from '@/types';

/** 可选的清单图标列表 */
const LIST_ICONS = ['List', 'Folder', 'Bookmark', 'Label', 'Flag', 'Category'];

interface ListFormProps {
  /** 关闭表单回调 */
  onClose: () => void;
}

/**
 * 新建清单表单。
 * 内联输入框，输入名称后回车创建清单。
 * 自动随机分配颜色和图标。
 */
function ListForm({ onClose }: ListFormProps): React.ReactElement {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const addList = useListStore((state) => state.addList);

  useEffect(() => {
    // 自动聚焦输入框
    inputRef.current?.focus();
  }, []);

  /** 随机选择颜色和图标 */
  const getRandomStyle = (): { color: string; icon: string } => {
    const color = LIST_COLORS[Math.floor(Math.random() * LIST_COLORS.length)];
    const icon = LIST_ICONS[Math.floor(Math.random() * LIST_ICONS.length)];
    return { color, icon };
  };

  /** 提交创建清单 */
  const handleSubmit = async (): Promise<void> => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      onClose();
      return;
    }

    const { color, icon } = getRandomStyle();
    const data: CreateListInput = {
      name: trimmedName,
      color,
      icon,
    };

    await addList(data);
    onClose();
  };

  /** 处理键盘事件 */
  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter') {
      handleSubmit();
    } else if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="flex items-center gap-1 px-2 py-1">
      <IconButton size="small" disabled>
        <AddIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
      </IconButton>
      <TextField
        inputRef={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          // 延迟关闭，避免点击其他地方时丢失输入
          setTimeout(() => {
            if (name.trim()) {
              handleSubmit();
            } else {
              onClose();
            }
          }, 150);
        }}
        placeholder={t('list.namePlaceholder')}
        variant="standard"
        fullWidth
        InputProps={{
          sx: { fontSize: 14 },
        }}
      />
      <IconButton size="small" onClick={onClose}>
        <CloseIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </div>
  );
}

export default ListForm;
