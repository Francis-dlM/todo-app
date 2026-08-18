/**
 * Todo App API 服务端逻辑。
 * 提供 REST API 中间件，直接读写 data/todo-data.json 文件。
 * 可作为 Vite 插件或独立 Express 服务器使用。
 *
 * 认证机制：
 *   - GET 请求：免认证（只读）
 *   - 写操作（POST/PUT/DELETE/PATCH）：
 *     方式1：nginx 注入 X-Internal-Auth 头（前端自动通过）
 *     方式2：外部 Agent 传 X-API-Key 头
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/todo-data.json');

// 认证密钥（从环境变量读取，兜底默认值）
const API_KEY = process.env.API_KEY || 'f1ee8762ded991b7570183c0a149c860';

/** 判断请求是否来自前端（浏览器 fetch 会带 Origin 头） */
function isFrontendRequest(req) {
  const origin = req.headers['origin'] || '';
  const referer = req.headers['referer'] || '';
  // Origin 或 Referer 包含服务器地址 → 前端请求
  const serverHosts = ['119.45.197.211', 'todo.francisdlm.cn', 'localhost'];
  return serverHosts.some(h => origin.includes(h) || referer.includes(h));
}

/** 读取数据文件 */
function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

/** 写入数据文件（格式化输出，方便其他 Agent 读取） */
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/** 解析请求体 */
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

/** 发送 JSON 响应 */
function json(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

/**
 * API 路由处理器。
 * 匹配 /api/* 请求并执行对应操作。
 * @returns true 表示已处理该请求，false 表示不匹配
 */
export async function handleApiRequest(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;
  const method = req.method;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return true;
  }

  // 写操作认证：GET 免认证，其他方法需验证身份
  // 前端请求（带 Origin/Referer）自动通过，外部 Agent 需传 X-API-Key
  if (method !== 'GET') {
    const apiKey = req.headers['x-api-key'];

    if (!isFrontendRequest(req) && apiKey !== API_KEY) {
      json(res, { error: 'Unauthorized. Provide X-API-Key header for write access.' }, 401);
      return true;
    }
  }

  // ==================== 列表 API ====================

  // GET /api/lists — 获取所有清单
  if (method === 'GET' && pathname === '/api/lists') {
    const data = readData();
    json(res, data.lists.sort((a, b) => a.order - b.order));
    return true;
  }

  // POST /api/lists — 创建清单
  if (method === 'POST' && pathname === '/api/lists') {
    const body = await parseBody(req);
    const data = readData();
    const maxOrder = data.lists.length > 0 ? Math.max(...data.lists.map(l => l.order)) : -1;
    const newList = {
      id: body.id || crypto.randomUUID(),
      name: body.name || '新清单',
      color: body.color || '#0078D4',
      icon: body.icon || 'List',
      order: body.order ?? (maxOrder + 1),
      createdAt: new Date().toISOString(),
      isDefault: false,
    };
    data.lists.push(newList);
    writeData(data);
    json(res, newList, 201);
    return true;
  }

  // PUT /api/lists/:id — 更新清单
  const listMatch = pathname.match(/^\/api\/lists\/([^/]+)$/);
  if (method === 'PUT' && listMatch) {
    const id = listMatch[1];
    const body = await parseBody(req);
    const data = readData();
    const idx = data.lists.findIndex(l => l.id === id);
    if (idx === -1) { json(res, { error: 'List not found' }, 404); return true; }
    // 不允许修改 id 和 isDefault
    delete body.id;
    delete body.isDefault;
    Object.assign(data.lists[idx], body);
    writeData(data);
    json(res, data.lists[idx]);
    return true;
  }

  // DELETE /api/lists/:id — 删除清单，任务移至默认清单
  if (method === 'DELETE' && listMatch) {
    const id = listMatch[1];
    const data = readData();
    const list = data.lists.find(l => l.id === id);
    if (!list) { json(res, { error: 'List not found' }, 404); return true; }
    if (list.isDefault) { json(res, { error: 'Default list cannot be deleted' }, 400); return true; }
    // 查找默认清单 ID
    const defaultList = data.lists.find(l => l.isDefault);
    const defaultListId = defaultList ? defaultList.id : 'default-inbox';
    data.lists = data.lists.filter(l => l.id !== id);
    // 将被删清单的任务移至默认清单，而非删除
    for (const task of data.tasks) {
      if (task.listId === id) {
        task.listId = defaultListId;
      }
    }
    writeData(data);
    json(res, { success: true });
    return true;
  }

  // PUT /api/lists/reorder — 重排清单
  if (method === 'PUT' && pathname === '/api/lists/reorder') {
    const body = await parseBody(req);
    const { listIds } = body;
    const data = readData();
    for (let i = 0; i < listIds.length; i++) {
      const list = data.lists.find(l => l.id === listIds[i]);
      if (list) list.order = i;
    }
    writeData(data);
    json(res, { success: true });
    return true;
  }

  // ==================== 任务 API ====================

  // GET /api/tasks — 获取任务（支持 ?listId= 和 ?keyword= 查询）
  if (method === 'GET' && pathname === '/api/tasks') {
    const data = readData();
    let tasks = data.tasks;
    const listId = url.searchParams.get('listId');
    const keyword = url.searchParams.get('keyword');
    const important = url.searchParams.get('important');
    const planned = url.searchParams.get('planned');
    const myDay = url.searchParams.get('myDay');

    if (listId) {
      tasks = tasks.filter(t => t.listId === listId).sort((a, b) => a.order - b.order);
    }
    if (keyword) {
      const lower = keyword.toLowerCase();
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(lower) ||
        (t.note && t.note.toLowerCase().includes(lower))
      );
    }
    if (important === 'true') {
      tasks = tasks.filter(t => t.isImportant && !t.isCompleted);
    }
    if (planned === 'true') {
      tasks = tasks.filter(t => !t.isCompleted && t.dueDate)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }
    if (myDay === 'true') {
      const today = new Date().toISOString().slice(0, 10);
      tasks = tasks.filter(t => t.isMyDay && t.myDayDate === today)
        .sort((a, b) => a.order - b.order);
    }

    json(res, tasks);
    return true;
  }

  // POST /api/tasks — 创建任务
  if (method === 'POST' && pathname === '/api/tasks') {
    const body = await parseBody(req);
    const data = readData();
    const listTasks = data.tasks.filter(t => t.listId === body.listId);
    const maxOrder = listTasks.length > 0 ? Math.max(...listTasks.map(t => t.order)) : -1;

    const newTask = {
      id: body.id || crypto.randomUUID(),
      title: body.title || '',
      note: body.note ?? '',
      listId: body.listId,
      isCompleted: false,
      isImportant: body.isImportant ?? false,
      isMyDay: body.isMyDay ?? false,
      myDayDate: body.isMyDay ? new Date().toISOString().slice(0, 10) : null,
      dueDate: body.dueDate ?? null,
      reminder: body.reminder ?? null,
      repeat: body.repeat ?? null,
      subtasks: body.subtasks ?? [],
      order: body.order ?? (maxOrder + 1),
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    data.tasks.push(newTask);
    writeData(data);
    json(res, newTask, 201);
    return true;
  }

  // GET /api/tasks/:id — 获取单个任务
  const taskMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/);
  if (method === 'GET' && taskMatch) {
    const id = taskMatch[1];
    const data = readData();
    const task = data.tasks.find(t => t.id === id);
    if (!task) { json(res, { error: 'Task not found' }, 404); return true; }
    json(res, task);
    return true;
  }

  // PUT /api/tasks/:id — 更新任务
  if (method === 'PUT' && taskMatch) {
    const id = taskMatch[1];
    const body = await parseBody(req);
    const data = readData();
    const idx = data.tasks.findIndex(t => t.id === id);
    if (idx === -1) { json(res, { error: 'Task not found' }, 404); return true; }
    delete body.id; // 不允许修改 id
    Object.assign(data.tasks[idx], body);
    writeData(data);
    json(res, data.tasks[idx]);
    return true;
  }

  // DELETE /api/tasks/:id — 删除任务
  if (method === 'DELETE' && taskMatch) {
    const id = taskMatch[1];
    const data = readData();
    data.tasks = data.tasks.filter(t => t.id !== id);
    writeData(data);
    json(res, { success: true });
    return true;
  }

  // PUT /api/tasks/reorder — 重排任务
  if (method === 'PUT' && pathname === '/api/tasks/reorder') {
    const body = await parseBody(req);
    const { taskIds } = body;
    const data = readData();
    for (let i = 0; i < taskIds.length; i++) {
      const task = data.tasks.find(t => t.id === taskIds[i]);
      if (task) task.order = i;
    }
    writeData(data);
    json(res, { success: true });
    return true;
  }

  // POST /api/tasks/:id/myday — 加入我的一天
  const myDayMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/myday$/);
  if (method === 'POST' && myDayMatch) {
    const id = myDayMatch[1];
    const data = readData();
    const task = data.tasks.find(t => t.id === id);
    if (!task) { json(res, { error: 'Task not found' }, 404); return true; }
    task.isMyDay = true;
    task.myDayDate = new Date().toISOString().slice(0, 10);
    writeData(data);
    json(res, task);
    return true;
  }

  // DELETE /api/tasks/:id/myday — 从我的一天移出
  if (method === 'DELETE' && myDayMatch) {
    const id = myDayMatch[1];
    const data = readData();
    const task = data.tasks.find(t => t.id === id);
    if (!task) { json(res, { error: 'Task not found' }, 404); return true; }
    task.isMyDay = false;
    task.myDayDate = null;
    writeData(data);
    json(res, task);
    return true;
  }

  // POST /api/myday/reset — 跨天重置
  if (method === 'POST' && pathname === '/api/myday/reset') {
    const today = new Date().toISOString().slice(0, 10);
    const data = readData();
    let changed = false;
    for (const task of data.tasks) {
      if (task.isMyDay && task.myDayDate !== today) {
        task.isMyDay = false;
        task.myDayDate = null;
        changed = true;
      }
    }
    if (changed) writeData(data);
    json(res, { success: true, resetCount: changed ? data.tasks.filter(t => !t.isMyDay).length : 0 });
    return true;
  }

  // GET /api/myday/suggestions — 智能推荐
  if (method === 'GET' && pathname === '/api/myday/suggestions') {
    const data = readData();
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const suggestions = data.tasks.filter(t => {
      if (t.isCompleted) return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate).getTime() <= today.getTime();
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    json(res, suggestions);
    return true;
  }

  // GET /api/export — 导出完整数据（方便 Agent 一次性读取）
  if (method === 'GET' && pathname === '/api/export') {
    const data = readData();
    json(res, data);
    return true;
  }

  return false; // 不匹配任何 API 路由
}
