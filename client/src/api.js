const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (response.status === 204) {
    return null;
  }

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || 'Request failed.');
  }

  return body;
}

export function getTasks({ status = 'all', search = '', signal } = {}) {
  const params = new URLSearchParams({ status });

  if (search.trim()) {
    params.set('search', search.trim());
  }

  return request(`/tasks?${params.toString()}`, { signal });
}

export function createTask(task) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify(task)
  });
}

export function updateTask(id, updates) {
  return request(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
}

export function reorderTasks(taskIds) {
  return request('/tasks/reorder', {
    method: 'PATCH',
    body: JSON.stringify({ taskIds })
  });
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: 'DELETE' });
}
