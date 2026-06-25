import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDataFile = path.resolve(__dirname, '../data/tasks.json');
const seedTasks = [
  {
    id: 'seed-task-1',
    title: 'Review project requirements',
    description: 'Confirm the MVP scope and note any missing details before implementation.',
    dueDate: null,
    completed: false,
    order: 0,
    createdAt: '2026-06-25T08:00:00.000Z',
    updatedAt: '2026-06-25T08:00:00.000Z'
  },
  {
    id: 'seed-task-2',
    title: 'Prepare Render deployment',
    description: 'Verify the production build serves the React app and API from the same service.',
    dueDate: '2026-06-26',
    completed: false,
    order: 1,
    createdAt: '2026-06-25T09:00:00.000Z',
    updatedAt: '2026-06-25T09:00:00.000Z'
  },
  {
    id: 'seed-task-3',
    title: 'Polish task list UI',
    description: 'Tune empty states, filters, and spacing after the first round of review.',
    dueDate: '2026-06-27',
    completed: true,
    order: 2,
    createdAt: '2026-06-25T10:00:00.000Z',
    updatedAt: '2026-06-25T11:30:00.000Z'
  }
];

export class TaskStore {
  constructor(filePath = process.env.TASKS_FILE || defaultDataFile, { seedOnMissing = true } = {}) {
    this.filePath = filePath;
    this.seedOnMissing = seedOnMissing;
  }

  async getAll() {
    await this.ensureFile();
    const contents = await readFile(this.filePath, 'utf8');
    return JSON.parse(contents);
  }

  async saveAll(tasks) {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(tasks, null, 2), 'utf8');
  }

  async ensureFile() {
    try {
      await readFile(this.filePath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }

      await this.saveAll(this.seedOnMissing ? seedTasks : []);
    }
  }
}
