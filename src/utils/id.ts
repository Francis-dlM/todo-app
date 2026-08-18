import { nanoid } from 'nanoid';

/**
 * 生成唯一 ID。
 * 使用 nanoid 生成 21 位 URL 安全字符串。
 * @returns 唯一 ID 字符串
 */
export function generateId(): string {
  return nanoid(21);
}
