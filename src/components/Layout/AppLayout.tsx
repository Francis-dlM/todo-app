import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import { useResponsive } from '@/hooks/useResponsive';
import { useUIStore } from '@/stores/uiStore';

/**
 * 主布局容器。
 * 桌面端双栏（左侧边栏 + 右侧内容区），移动端单栏 + 侧边栏Drawer。
 */
function AppLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  const { isMobile } = useResponsive();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        minHeight: '100dvh',
        justifyContent: 'center',
        bgcolor: isMobile ? 'background.default' : 'grey.100',
      }}
    >
      {/* 整体最大宽度容器（桌面端限制，移动端全宽） */}
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          maxWidth: isMobile ? '100%' : 1400,
          bgcolor: 'background.paper',
          boxShadow: { md: '0 0 40px rgba(0,0,0,0.08)' },
          // 移动端用 dvh 避免地址栏遮挡，桌面端用 vh
          height: isMobile ? '100dvh' : '100vh',
          overflow: 'hidden',
        }}
      >
        {/* 桌面端侧边栏 */}
        {!isMobile && (
          <Box
            sx={{
              width: sidebarOpen ? 280 : 0,
              minWidth: sidebarOpen ? 280 : 0,
              transition: 'width 0.25s ease, min-width 0.25s ease',
              overflow: 'hidden',
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            {sidebarOpen && <Sidebar />}
          </Box>
        )}

        {/* 移动端侧边栏（Drawer） */}
        {isMobile && <Sidebar />}

        {/* 主内容区 */}
        <Box
          className="flex flex-col flex-1 overflow-hidden"
          sx={{ bgcolor: 'background.default' }}
        >
          <Header />
          <Box
            className="flex-1 overflow-y-auto"
            sx={{
              p: { xs: 2, sm: 3 },
              pb: { xs: 2, sm: 3 },
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AppLayout;
