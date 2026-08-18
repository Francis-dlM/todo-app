import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  IconButton,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useResponsive } from '@/hooks/useResponsive';
import { useUIStore } from '@/stores/uiStore';
import type { DesktopViewId } from '@/stores/uiStore';
import { useListStore } from '@/stores/listStore';
import { DEFAULT_LIST_ID } from '@/utils/constants';

/** 桌面端视图 ID 到标题 i18n key 的映射 */
const DESKTOP_VIEW_TITLES: Record<DesktopViewId, string> = {
  myday: 'nav.myDay',
  important: 'nav.important',
  planned: 'nav.planned',
  all: 'nav.all',
  inbox: 'nav.inbox',
  search: 'nav.search',
  list: '',
};

/**
 * 内容区顶部栏。
 * 显示当前视图标题，右侧搜索入口图标，移动端汉堡菜单按钮。
 */
function Header(): React.ReactElement {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setMobileTab = useUIStore((state) => state.setMobileTab);
  const activeMobileTab = useUIStore((state) => state.activeMobileTab);
  const activeDesktopView = useUIStore((state) => state.activeDesktopView);
  const setDesktopView = useUIStore((state) => state.setDesktopView);
  const activeListId = useListStore((state) => state.activeListId);
  const lists = useListStore((state) => state.lists);

  /** 获取当前标题 */
  const getTitle = (): string => {
    if (isMobile) {
      switch (activeMobileTab) {
        case 'myday':
          return t('nav.myDay');
        case 'important':
          return t('nav.important');
        case 'planned':
          return t('nav.planned');
        case 'inbox':
          return t('nav.inbox');
        case 'search':
          return t('nav.search');
        default:
          return t('app.name');
      }
    }

    // 桌面端根据 activeDesktopView 决定标题
    if (activeDesktopView === 'list') {
      if (activeListId === DEFAULT_LIST_ID) {
        return t('nav.inbox');
      }
      const activeList = lists.find((l) => l.id === activeListId);
      return activeList?.name ?? t('app.name');
    }

    const titleKey = DESKTOP_VIEW_TITLES[activeDesktopView];
    return titleKey ? t(titleKey) : t('app.name');
  };

  /** 处理搜索按钮点击 */
  const handleSearchClick = (): void => {
    if (isMobile) {
      setMobileTab('search');
    } else {
      setDesktopView('search');
    }
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 48, sm: 56 } }}>
        {/* 移动端汉堡菜单 */}
        {isMobile && (
          <IconButton
            edge="start"
            onClick={toggleSidebar}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* 标题 */}
        <Typography
          variant="h6"
          sx={{
            flex: 1,
            fontWeight: 600,
            fontSize: { xs: 18, sm: 20 },
          }}
        >
          {getTitle()}
        </Typography>

        {/* 搜索入口 */}
        <IconButton onClick={handleSearchClick}>
          <SearchIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
