import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDataFile = path.resolve(__dirname, '../data/tasks.json');

export class TaskStore {
  constructor(filePath = process.env.TASKS_FILE || defaultDataFile) {
    this.filePath = filePath;
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

      await this.saveAll([]);
    }
  }
}
