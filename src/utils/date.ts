import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import isYesterday from 'dayjs/plugin/isYesterday';
import localeData from 'dayjs/plugin/localeData';
import 'dayjs/locale/zh-cn';

// 加载 dayjs 插件
dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isYesterday);
dayjs.extend(localeData);

// 设置中文 locale
dayjs.locale('zh-cn');

/**
 * 格式化日期为指定格式字符串。
 * @param date - 日期对象、字符串或时间戳
 * @param format - 格式模板，默认 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  format: string = 'YYYY-MM-DD',
): string {
  if (!date) return '';
  return dayjs(date).format(format);
}

/**
 * 格式化日期为友好的相对时间描述。
 * @param date - 日期对象、字符串或时间戳
 * @returns 友好的日期描述（如"今天"、"明天"、"3天后"）
 */
export function formatRelativeDate(
  date: Date | string | number | null | undefined,
): string {
  if (!date) return '';
  const d = dayjs(date);
  if (d.isToday()) return '今天';
  if (d.isTomorrow()) return '明天';
  if (d.isYesterday()) return '昨天';
  return d.fromNow();
}

/**
 * 判断日期是否已过期（早于今天）。
 * @param date - 日期对象、字符串或时间戳
 * @returns 是否已过期
 */
export function isOverdue(date: Date | string | number | null | undefined): boolean {
  if (!date) return false;
  return dayjs(date).isBefore(dayjs().startOf('day'));
}

/**
 * 判断日期是否是今天。
 * @param date - 日期对象、字符串或时间戳
 * @returns 是否是今天
 */
export function isDateToday(date: Date | string | number | null | undefined): boolean {
  if (!date) return false;
  return dayjs(date).isToday();
}

/**
 * 获取今天的日期字符串（YYYY-MM-DD 格式）。
 * @returns 今天的日期字符串
 */
export function getTodayString(): string {
  return dayjs().format('YYYY-MM-DD');
}

/**
 * 获取明天的日期。
 * @returns 明天的 dayjs 对象
 */
export function getTomorrow(): dayjs.Dayjs {
  return dayjs().add(1, 'day');
}

/**
 * 获取本周日的日期。
 * @returns 本周日的 dayjs 对象
 */
export function getThisSunday(): dayjs.Dayjs {
  return dayjs().endOf('week');
}

/**
 * 比较两个日期是否是同一天。
 * @param a - 第一个日期
 * @param b - 第二个日期
 * @returns 是否是同一天
 */
export function isSameDay(
  a: Date | string | number | null | undefined,
  b: Date | string | number | null | undefined,
): boolean {
  if (!a || !b) return false;
  return dayjs(a).isSame(dayjs(b), 'day');
}

export { dayjs };
