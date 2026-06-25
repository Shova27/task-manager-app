export function cleanTaskInput(body, { partial = false } = {}) {
  const allowedFields = ['title', 'description', 'dueDate', 'completed'];
  const input = {};

  for (const field of allowedFields) {
    if (Object.hasOwn(body, field)) {
      input[field] = body[field];
    }
  }

  if (!partial || Object.hasOwn(input, 'title')) {
    if (typeof input.title !== 'string' || input.title.trim().length === 0) {
      return { error: 'Title is required.' };
    }
    input.title = input.title.trim();
  }

  if (Object.hasOwn(input, 'description')) {
    input.description = typeof input.description === 'string' ? input.description.trim() : '';
  }

  if (Object.hasOwn(input, 'dueDate')) {
    if (input.dueDate === '' || input.dueDate === null) {
      input.dueDate = null;
    } else if (typeof input.dueDate !== 'string' || Number.isNaN(Date.parse(input.dueDate))) {
      return { error: 'Due date must be a valid date string.' };
    }
  }

  if (Object.hasOwn(input, 'completed') && typeof input.completed !== 'boolean') {
    return { error: 'Completed must be true or false.' };
  }

  return { value: input };
}

export function cleanReorderInput(body) {
  if (!Array.isArray(body?.taskIds) || body.taskIds.length === 0) {
    return { error: 'Task order is required.' };
  }

  const taskIds = body.taskIds.map((id) => (typeof id === 'string' ? id.trim() : ''));

  if (taskIds.some((id) => id.length === 0)) {
    return { error: 'Task order must contain valid task ids.' };
  }

  if (new Set(taskIds).size !== taskIds.length) {
    return { error: 'Task order cannot contain duplicate ids.' };
  }

  return { value: { taskIds } };
}

export function filterTasks(tasks, query) {
  const status = query.status || 'all';
  const search = query.search?.toString().trim().toLowerCase();

  return tasks.filter((task) => {
    const statusMatches =
      status === 'all' ||
      (status === 'active' && !task.completed) ||
      (status === 'completed' && task.completed);
    const searchMatches = !search || task.title.toLowerCase().includes(search);

    return statusMatches && searchMatches;
  });
}

export function getCounts(tasks) {
  return tasks.reduce(
    (counts, task) => {
      if (task.completed) {
        counts.completed += 1;
      } else {
        counts.active += 1;
      }

      return counts;
    },
    { active: 0, completed: 0, total: tasks.length }
  );
}
