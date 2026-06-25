import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import cors from 'cors';
import express from 'express';
import { TaskStore } from './storage.js';
import { cleanReorderInput, cleanTaskInput, filterTasks, getCounts } from './validators.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const clientIndexPath = path.join(clientDistPath, 'index.html');

export function createApp({ store = new TaskStore() } = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/tasks', async (req, res, next) => {
    try {
      const tasks = await store.getAll();
      const sortedTasks = sortTasks(tasks);

      res.json({
        data: filterTasks(sortedTasks, req.query),
        meta: getCounts(tasks)
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/tasks', async (req, res, next) => {
    try {
      const { value, error } = cleanTaskInput(req.body);

      if (error) {
        return res.status(400).json({ error });
      }

      const tasks = await store.getAll();
      const now = new Date().toISOString();
      const task = {
        id: crypto.randomUUID(),
        title: value.title,
        description: value.description || '',
        dueDate: value.dueDate || null,
        completed: false,
        order: getNextOrder(tasks),
        createdAt: now,
        updatedAt: now
      };

      await store.saveAll([task, ...tasks]);

      return res.status(201).json({ data: task });
    } catch (error) {
      return next(error);
    }
  });

  app.patch('/api/tasks/reorder', async (req, res, next) => {
    try {
      const { value, error } = cleanReorderInput(req.body);

      if (error) {
        return res.status(400).json({ error });
      }

      const tasks = await store.getAll();
      const tasksById = new Map(tasks.map((task) => [task.id, task]));

      if (value.taskIds.some((id) => !tasksById.has(id))) {
        return res.status(404).json({ error: 'One or more tasks were not found.' });
      }

      const updatedAt = new Date().toISOString();
      const orderedTasks = value.taskIds.map((id, index) => ({
        ...tasksById.get(id),
        order: index,
        updatedAt
      }));

      await store.saveAll(orderedTasks);

      return res.json({ data: sortTasks(orderedTasks), meta: getCounts(orderedTasks) });
    } catch (error) {
      return next(error);
    }
  });

  app.patch('/api/tasks/:id', async (req, res, next) => {
    try {
      const { value, error } = cleanTaskInput(req.body, { partial: true });

      if (error) {
        return res.status(400).json({ error });
      }

      const tasks = await store.getAll();
      const taskIndex = tasks.findIndex((task) => task.id === req.params.id);

      if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found.' });
      }

      const updatedTask = {
        ...tasks[taskIndex],
        ...value,
        updatedAt: new Date().toISOString()
      };

      tasks[taskIndex] = updatedTask;
      await store.saveAll(tasks);

      return res.json({ data: updatedTask });
    } catch (error) {
      return next(error);
    }
  });

  app.delete('/api/tasks/:id', async (req, res, next) => {
    try {
      const tasks = await store.getAll();
      const taskExists = tasks.some((task) => task.id === req.params.id);

      if (!taskExists) {
        return res.status(404).json({ error: 'Task not found.' });
      }

      await store.saveAll(tasks.filter((task) => task.id !== req.params.id));

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Route not found.' });
  });

  if (existsSync(clientIndexPath)) {
    app.use(express.static(clientDistPath));

    app.get('*', (req, res) => {
      res.sendFile(clientIndexPath);
    });
  } else {
    app.use((req, res) => {
      res.status(404).json({ error: 'Route not found.' });
    });
  }

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' });
  });

  return app;
}

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    const orderA = Number.isFinite(a.order) ? a.order : Number.MAX_SAFE_INTEGER;
    const orderB = Number.isFinite(b.order) ? b.order : Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

function getNextOrder(tasks) {
  const orders = tasks.map((task) => task.order).filter(Number.isFinite);
  return orders.length === 0 ? 0 : Math.min(...orders) - 1;
}
