import { useMediaQuery, useTheme } from '@mui/material';

/**
 * 响应式断点判断 Hook。
 * 基于 MUI useMediaQuery 封装，提供设备类型判断。
 *
 * 断点定义：
 * - mobile: 宽度 < 600px (xs)
 * - tablet: 宽度 600px ~ 960px (sm + md)
 * - desktop: 宽度 > 960px (lg 及以上)
 *
 * @returns 包含 isMobile, isTablet, isDesktop 的对象
 */
export function useResponsive(): {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
} {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg')); // 600px ~ 960px
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // >= 960px

  return { isMobile, isTablet, isDesktop };
}
