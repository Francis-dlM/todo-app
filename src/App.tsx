import React from 'react';
import { ThemeProvider, CssBaseline, Box, Typography, CircularProgress } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import theme from '@/styles/theme';
import AppLayout from '@/components/Layout/AppLayout';
import { useDatabase } from '@/hooks/useDatabase';
import { useResponsive } from '@/hooks/useResponsive';
import { useUIStore } from '@/stores/uiStore';
import { useListStore } from '@/stores/listStore';
import MyDayPage from '@/pages/MyDayPage';
import ImportantPage from '@/pages/ImportantPage';
import PlannedPage from '@/pages/PlannedPage';
import InboxPage from '@/pages/InboxPage';
import ListDetailPage from '@/pages/ListDetailPage';
import SearchPage from '@/pages/SearchPage';
import AllTasksPage from '@/pages/AllTasksPage';
import TaskDetail from '@/components/Task/TaskDetail';
import { DEFAULT_LIST_ID } from '@/utils/constants';
import { useTranslation } from 'react-i18next';

/** 页面切换动画变体 */
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.2,
};

/**
 * 根组件。
 * ThemeProvider + AppLayout + 根据当前视图渲染对应页面。
 */
function App(): React.ReactElement {
  const { isReady } = useDatabase();
  const { isMobile } = useResponsive();
  const { t } = useTranslation();
  const activeMobileTab = useUIStore((state) => state.activeMobileTab);
  const activeDesktopView = useUIStore((state) => state.activeDesktopView);
  const activeListId = useListStore((state) => state.activeListId);

  /** 获取移动端页面 */
  const getMobilePage = (): React.ReactNode => {
    switch (activeMobileTab) {
      case 'myday':
        return <MyDayPage />;
      case 'important':
        return <ImportantPage />;
      case 'planned':
        return <PlannedPage />;
      case 'inbox':
        return <InboxPage />;
      case 'search':
        return <SearchPage />;
      case 'all':
        return <AllTasksPage />;
      default:
        return <MyDayPage />;
    }
  };

  /** 获取桌面端页面 */
  const getDesktopPage = (): React.ReactNode => {
    switch (activeDesktopView) {
      case 'myday':
        return <MyDayPage />;
      case 'important':
        return <ImportantPage />;
      case 'planned':
        return <PlannedPage />;
      case 'all':
        return <AllTasksPage />;
      case 'inbox':
        return <InboxPage />;
      case 'search':
        return <SearchPage />;
      case 'list':
        if (activeListId === DEFAULT_LIST_ID) {
          return <InboxPage />;
        }
        return <ListDetailPage listId={activeListId} />;
      default:
        return <MyDayPage />;
    }
  };

  /** 获取当前应渲染的页面内容 */
  const renderPage = (): React.ReactNode => {
    const pageKey = isMobile ? activeMobileTab : `${activeDesktopView}-${activeListId}`;
    const pageContent = isMobile ? getMobilePage() : getDesktopPage();

    return (
      <motion.div
        key={pageKey}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        {pageContent}
      </motion.div>
    );
  };

  // 数据库未初始化时显示加载中
  if (!isReady) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          className="flex flex-col items-center justify-center h-screen"
          sx={{ bgcolor: 'background.default' }}
        >
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            {t('app.loading')}
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout>
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </AppLayout>
      <TaskDetail />
    </ThemeProvider>
  );
}

export default App;
