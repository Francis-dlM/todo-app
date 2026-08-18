/**
 * Todo App API 服务器。
 * 独立运行：node server/api-server.mjs
 * 监听端口 3001，提供 /api/* REST 接口。
 * 数据文件：../data/todo-data.json
 * 
 * 其他 AI Agent 可直接读取数据文件：
 *   路径：todo-app/data/todo-data.json
 *   格式：{ lists: [...], tasks: [...] }
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/todo-data.json');
const PORT = 3001;

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

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

function jsonResponse(res, data, status = 200) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    jsonResponse(res, {}, 204);
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  const method = req.method;

  try {
    // ===== LISTS =====
    if (method === 'GET' && pathname === '/api/lists') {
      const data = readData();
      jsonResponse(res, data.lists.sort((a, b) => a.order - b.order));
      return;
    }
    if (method === 'POST' && pathname === '/api/lists') {
      const body = await parseBody(req);
      const data = readData();
      const maxOrder = data.lists.length > 0 ? Math.max(...data.lists.map(l => l.order)) : -1;
      const newList = { id: body.id || crypto.randomUUID(), name: body.name || '新清单', color: body.color || '#0078D4', icon: body.icon || 'List', order: body.order ?? (maxOrder + 1), createdAt: new Date().toISOString(), isDefault: false };
      data.lists.push(newList);
      writeData(data);
      jsonResponse(res, newList, 201);
      return;
    }
    if (method === 'PUT' && pathname === '/api/lists/reorder') {
      const { listIds } = await parseBody(req);
      const data = readData();
      for (let i = 0; i < listIds.length; i++) { const l = data.lists.find(x => x.id === listIds[i]); if (l) l.order = i; }
      writeData(data);
      jsonResponse(res, { success: true });
      return;
    }
    const listMatch = pathname.match(/^\/api\/lists\/([^/]+)$/);
    if (listMatch) {
      const id = listMatch[1];
      if (method === 'PUT') {
        const body = await parseBody(req);
        const data = readData();
        const idx = data.lists.findIndex(l => l.id === id);
        if (idx === -1) { jsonResponse(res, { error: 'List not found' }, 404); return; }
        delete body.id; delete body.isDefault;
        Object.assign(data.lists[idx], body);
        writeData(data);
        jsonResponse(res, data.lists[idx]);
        return;
      }
      if (method === 'DELETE') {
        const data = readData();
        const list = data.lists.find(l => l.id === id);
        if (!list) { jsonResponse(res, { error: 'List not found' }, 404); return; }
        if (list.isDefault) { jsonResponse(res, { error: 'Default list cannot be deleted' }, 400); return; }
        data.lists = data.lists.filter(l => l.id !== id);
        data.tasks = data.tasks.filter(t => t.listId !== id);
        writeData(data);
        jsonResponse(res, { success: true });
        return;
      }
    }

    // ===== TASKS =====
    if (method === 'GET' && pathname === '/api/tasks') {
      const data = readData();
      let tasks = data.tasks;
      const listId = url.searchParams.get('listId');
      const keyword = url.searchParams.get('keyword');
      const important = url.searchParams.get('important');
      const planned = url.searchParams.get('planned');
      const myDay = url.searchParams.get('myDay');
      if (listId) tasks = tasks.filter(t => t.listId === listId).sort((a, b) => a.order - b.order);
      if (keyword) { const lw = keyword.toLowerCase(); tasks = tasks.filter(t => t.title.toLowerCase().includes(lw) || (t.note && t.note.toLowerCase().includes(lw))); }
      if (important === 'true') tasks = tasks.filter(t => t.isImportant && !t.isCompleted);
      if (planned === 'true') tasks = tasks.filter(t => !t.isCompleted && t.dueDate).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      if (myDay === 'true') { const today = new Date().toISOString().slice(0, 10); tasks = tasks.filter(t => t.isMyDay && t.myDayDate === today).sort((a, b) => a.order - b.order); }
      jsonResponse(res, tasks);
      return;
    }
    if (method === 'POST' && pathname === '/api/tasks') {
      const body = await parseBody(req);
      const data = readData();
      const listTasks = data.tasks.filter(t => t.listId === body.listId);
      const maxOrder = listTasks.length > 0 ? Math.max(...listTasks.map(t => t.order)) : -1;
      const newTask = { id: body.id || crypto.randomUUID(), title: body.title || '', note: body.note ?? '', listId: body.listId, isCompleted: false, isImportant: body.isImportant ?? false, isMyDay: body.isMyDay ?? false, myDayDate: body.isMyDay ? new Date().toISOString().slice(0, 10) : null, dueDate: body.dueDate ?? null, reminder: body.reminder ?? null, repeat: body.repeat ?? null, subtasks: body.subtasks ?? [], priority: body.priority ?? 'NONE', order: body.order ?? (maxOrder + 1), createdAt: new Date().toISOString(), completedAt: null };
      data.tasks.push(newTask);
      writeData(data);
      jsonResponse(res, newTask, 201);
      return;
    }
    if (method === 'PUT' && pathname === '/api/tasks/reorder') {
      const { taskIds } = await parseBody(req);
      const data = readData();
      for (let i = 0; i < taskIds.length; i++) { const t = data.tasks.find(x => x.id === taskIds[i]); if (t) t.order = i; }
      writeData(data);
      jsonResponse(res, { success: true });
      return;
    }
    const taskMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/);
    if (taskMatch) {
      const id = taskMatch[1];
      if (method === 'GET') {
        const data = readData();
        const task = data.tasks.find(t => t.id === id);
        if (!task) { jsonResponse(res, { error: 'Task not found' }, 404); return; }
        jsonResponse(res, task);
        return;
      }
      if (method === 'PUT') {
        const body = await parseBody(req);
        const data = readData();
        const idx = data.tasks.findIndex(t => t.id === id);
        if (idx === -1) { jsonResponse(res, { error: 'Task not found' }, 404); return; }
        delete body.id;
        Object.assign(data.tasks[idx], body);
        writeData(data);
        jsonResponse(res, data.tasks[idx]);
        return;
      }
      if (method === 'DELETE') {
        const data = readData();
        data.tasks = data.tasks.filter(t => t.id !== id);
        writeData(data);
        jsonResponse(res, { success: true });
        return;
      }
    }
    const myDayMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/myday$/);
    if (myDayMatch) {
      const id = myDayMatch[1];
      const data = readData();
      const task = data.tasks.find(t => t.id === id);
      if (!task) { jsonResponse(res, { error: 'Task not found' }, 404); return; }
      if (method === 'POST') { task.isMyDay = true; task.myDayDate = new Date().toISOString().slice(0, 10); }
      if (method === 'DELETE') { task.isMyDay = false; task.myDayDate = null; }
      writeData(data);
      jsonResponse(res, task);
      return;
    }
    if (method === 'POST' && pathname === '/api/myday/reset') {
      const today = new Date().toISOString().slice(0, 10);
      const data = readData();
      for (const task of data.tasks) { if (task.isMyDay && task.myDayDate !== today) { task.isMyDay = false; task.myDayDate = null; } }
      writeData(data);
      jsonResponse(res, { success: true });
      return;
    }
    if (method === 'GET' && pathname === '/api/myday/suggestions') {
      const data = readData();
      const today = new Date(); today.setHours(23, 59, 59, 999);
      const suggestions = data.tasks.filter(t => !t.isCompleted && t.dueDate && new Date(t.dueDate).getTime() <= today.getTime()).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      jsonResponse(res, suggestions);
      return;
    }
    if (method === 'GET' && pathname === '/api/export') {
      jsonResponse(res, readData());
      return;
    }

    // 404
    jsonResponse(res, { error: 'Not found' }, 404);
  } catch (err) {
    console.error('API error:', err);
    jsonResponse(res, { error: 'Internal server error' }, 500);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  📡 Todo App API 服务器运行中`);
  console.log(`  🔗 http://localhost:${PORT}/api/`);
  console.log(`  📱 局域网: http://192.168.1.40:${PORT}/api/`);
  console.log(`  📄 数据文件: ${DATA_FILE}\n`);
});
