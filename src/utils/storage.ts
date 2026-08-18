/**
 * localStorage 辅助函数。
 * 提供类型安全的 localStorage 读写操作。
 */

/**
 * 从 localStorage 读取值并自动解析 JSON。
 * @param key - 存储键名
 * @param defaultValue - 读取失败时的默认值
 * @returns 解析后的值或默认值
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * 将值序列化为 JSON 写入 localStorage。
 * @param key - 存储键名
 * @param value - 要存储的值
 */
export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to set localStorage item "${key}":`, error);
  }
}

/**
 * 从 localStorage 删除指定键。
 * @param key - 存储键名
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove localStorage item "${key}":`, error);
  }
}

/**
 * 清除所有应用相关的 localStorage 条目。
 * 仅删除带有应用前缀的键。
 * @param prefix - 键名前缀，默认 'todo-app:'
 */
export function clearStorageItems(prefix: string = 'todo-app:'): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to clear localStorage items:', error);
  }
}
