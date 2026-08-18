import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import {
  WbSunny as WbSunnyIcon,
  StarBorder as StarBorderIcon,
  CalendarMonth as CalendarMonthIcon,
  Inbox as InboxIcon,
} from '@mui/icons-material';
import { useUIStore } from '@/stores/uiStore';
import { useTaskStore } from '@/stores/taskStore';
import { useMyDayStore } from '@/stores/myDayStore';
import { useListStore } from '@/stores/listStore';
import { DEFAULT_LIST_ID } from '@/utils/constants';
import type { MobileTab } from '@/types';

/** 移动端底部 Tab 映射 */
const MOBILE_TABS: { id: MobileTab; icon: React.ReactElement; labelKey: string }[] = [
  { id: 'myday', icon: <WbSunnyIcon />, labelKey: 'nav.myDay' },
  { id: 'important', icon: <StarBorderIcon />, labelKey: 'nav.important' },
  { id: 'planned', icon: <CalendarMonthIcon />, labelKey: 'nav.planned' },
  { id: 'inbox', icon: <InboxIcon />, labelKey: 'nav.inbox' },
];

/**
 * 移动端底部 Tab 栏。
 * 4 个 Tab：我的一天、重要、计划内、任务。
 * 点击切换 activeMobileTab。
 */
function MobileNav(): React.ReactElement {
  const { t } = useTranslation();
  const activeMobileTab = useUIStore((state) => state.activeMobileTab);
  const setMobileTab = useUIStore((state) => state.setMobileTab);

  const loadMyDay = useMyDayStore((state) => state.loadMyDay);
  const loadImportantTasks = useTaskStore((state) => state.loadImportantTasks);
  const loadPlannedTasks = useTaskStore((state) => state.loadPlannedTasks);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const setActiveList = useListStore((state) => state.setActiveList);

  /** 处理 Tab 切换 */
  const handleChange = (_event: React.SyntheticEvent, newValue: MobileTab): void => {
    setMobileTab(newValue);

    // 加载对应数据
    switch (newValue) {
      case 'myday':
        loadMyDay();
        break;
      case 'important':
        loadImportantTasks();
        break;
      case 'planned':
        loadPlannedTasks();
        break;
      case 'inbox':
        loadTasks(DEFAULT_LIST_ID);
        setActiveList(DEFAULT_LIST_ID);
        break;
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        flexShrink: 0,
      }}
    >
      <BottomNavigation
        value={activeMobileTab}
        onChange={handleChange}
        showLabels
        sx={{ height: 56 }}
      >
        {MOBILE_TABS.map((tab) => (
          <BottomNavigationAction
            key={tab.id}
            value={tab.id}
            icon={tab.icon}
            label={t(tab.labelKey)}
            sx={{
              minWidth: 'auto',
              '& .MuiBottomNavigationAction-label': {
                fontSize: 11,
                mt: 0.5,
                '&.Mui-selected': {
                  fontSize: 11,
                },
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

export default MobileNav;
