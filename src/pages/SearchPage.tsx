import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';
import SearchBar from '@/components/Common/SearchBar';
import TaskItem from '@/components/Task/TaskItem';
import EmptyState from '@/components/Common/EmptyState';
import type { Task } from '@/types';

/**
 * 搜索页面。
 * 顶部 SearchBar + 搜索结果列表。
 */
function SearchPage(): React.ReactElement {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Task[]>([]);
  const searchTasks = useTaskStore((state) => state.searchTasks);

  /** 处理搜索 */
  const handleSearch = useCallback(
    async (value: string): Promise<void> => {
      setKeyword(value);
      if (value.trim()) {
        await searchTasks(value);
        const currentTasks = useTaskStore.getState().tasks;
        setResults(currentTasks);
      } else {
        setResults([]);
      }
    },
    [searchTasks],
  );

  return (
    <Box>
      {/* 搜索栏 */}
      <Box sx={{ mb: 3 }}>
        <SearchBar onSearch={handleSearch} />
      </Box>

      {/* 搜索结果 */}
      {keyword.trim() === '' ? (
        <EmptyState
          icon={<SearchIcon sx={{ fontSize: 64 }} />}
          title={t('search.placeholder')}
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={<SearchIcon sx={{ fontSize: 64 }} />}
          title={t('search.noResults')}
        />
      ) : (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            {t('search.results')} ({results.length})
          </Typography>
          <AnimatePresence>
            {results.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </AnimatePresence>
        </Box>
      )}
    </Box>
  );
}

export default SearchPage;
