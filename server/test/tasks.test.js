import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { TaskStore } from '../src/storage.js';

let tempDir;
let app;

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), 'task-manager-test-'));
  const store = new TaskStore(path.join(tempDir, 'tasks.json'));
  app = createApp({ store });
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe('task API', () => {
  it('creates and lists tasks newest first', async () => {
    const first = await request(app).post('/api/tasks').send({ title: 'Older task' }).expect(201);
    const second = await request(app)
      .post('/api/tasks')
      .send({ title: 'Newer task', dueDate: '2030-01-01' })
      .expect(201);

    const response = await request(app).get('/api/tasks').expect(200);

    assert.equal(response.body.data.length, 2);
    assert.equal(response.body.data[0].id, second.body.data.id);
    assert.equal(response.body.data[1].id, first.body.data.id);
    assert.deepEqual(response.body.meta, { active: 2, completed: 0, total: 2 });
  });

  it('persists a custom task order', async () => {
    const first = await request(app).post('/api/tasks').send({ title: 'First task' }).expect(201);
    const second = await request(app).post('/api/tasks').send({ title: 'Second task' }).expect(201);
    const third = await request(app).post('/api/tasks').send({ title: 'Third task' }).expect(201);

    await request(app)
      .patch('/api/tasks/reorder')
      .send({ taskIds: [first.body.data.id, third.body.data.id, second.body.data.id] })
      .expect(200);

    const response = await request(app).get('/api/tasks').expect(200);
    assert.deepEqual(
      response.body.data.map((task) => task.id),
      [first.body.data.id, third.body.data.id, second.body.data.id]
    );
  });

  it('updates, filters, and deletes a task', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Draft README' });

    await request(app)
      .patch(`/api/tasks/${created.body.data.id}`)
      .send({ completed: true, title: 'Finish README' })
      .expect(200);

    const completed = await request(app).get('/api/tasks?status=completed&search=finish').expect(200);
    assert.equal(completed.body.data.length, 1);
    assert.equal(completed.body.data[0].completed, true);

    await request(app).delete(`/api/tasks/${created.body.data.id}`).expect(204);

    const afterDelete = await request(app).get('/api/tasks').expect(200);
    assert.equal(afterDelete.body.data.length, 0);
  });
});
