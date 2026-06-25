# Personal Task Manager

This project is my solution for the Studio Graphene full-stack task management exercise. I chose the personal task manager exercise and built a single-user task board where a reviewer can create, edit, complete, delete, search, filter, and reorder tasks. The app uses a React frontend, an Express API, and JSON-file persistence so it can be reviewed locally without setting up an external database.

## Live Demo Links

Not deployed yet.

- Frontend: Not available
- Backend API: Not available

## Tech Stack

- **React + Vite:** Used for a fast, modern frontend development setup with simple component structure.
- **Tailwind CSS:** Used for responsive styling, premium UI polish, hover states, and layout without a heavy component framework.
- **Lucide React:** Used for consistent, accessible icons across buttons, empty states, and task actions.
- **@dnd-kit:** Used for accessible drag-and-drop task reordering with keyboard and pointer support.
- **Node.js + Express:** Used for a small REST API with clear task routes.
- **JSON file storage:** Tasks are saved in `server/data/tasks.json` so the app persists data locally without requiring a database.
- **Node test runner + Supertest:** Used for API tests covering task creation, listing, updating, filtering, deleting, and reordering.
- **Concurrently:** Used to run the frontend and backend together with one command.

## How to Run Locally

Assume Node.js 20 or newer is installed.

Copy and paste these commands from the project root:

```bash
npm install
npm run dev
```

The app will run at:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`

Run tests:

```bash
npm test
```

Build the frontend:

```bash
npm run build
```

Run only the backend:

```bash
npm run dev --workspace server
```

Run only the frontend:

```bash
npm run dev --workspace client
```

If port `4000` is already being used by an existing API process, the server prints a friendly message instead of a long crash stack.

## API Documentation

Base URL: `http://localhost:4000/api`

### Health Check

**Method:** `GET`

**Path:** `/health`

**Request body:** None

**Response shape:**

```json
{
  "status": "ok"
}
```

### List Tasks

**Method:** `GET`

**Path:** `/tasks`

**Query params:**

- `status`: optional, one of `all`, `active`, or `completed`
- `search`: optional, searches task titles

**Request body:** None

**Response shape:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Finish README",
      "description": "Document local setup",
      "dueDate": "2026-06-30",
      "completed": false,
      "order": 0,
      "createdAt": "2026-06-25T08:00:00.000Z",
      "updatedAt": "2026-06-25T08:00:00.000Z"
    }
  ],
  "meta": {
    "active": 1,
    "completed": 0,
    "total": 1
  }
}
```

### Create Task

**Method:** `POST`

**Path:** `/tasks`

**Request body:**

```json
{
  "title": "Finish README",
  "description": "Document local setup",
  "dueDate": "2026-06-30"
}
```

`title` is required. `description` and `dueDate` are optional.

**Response shape:** `201 Created`

```json
{
  "data": {
    "id": "uuid",
    "title": "Finish README",
    "description": "Document local setup",
    "dueDate": "2026-06-30",
    "completed": false,
    "order": 0,
    "createdAt": "2026-06-25T08:00:00.000Z",
    "updatedAt": "2026-06-25T08:00:00.000Z"
  }
}
```

### Update Task

**Method:** `PATCH`

**Path:** `/tasks/:id`

**Request body:**

```json
{
  "title": "Finish and proofread README",
  "description": "Include API docs",
  "dueDate": null,
  "completed": true
}
```

All fields are optional, but at least one editable field should be sent.

**Response shape:**

```json
{
  "data": {
    "id": "uuid",
    "title": "Finish and proofread README",
    "description": "Include API docs",
    "dueDate": null,
    "completed": true,
    "order": 0,
    "createdAt": "2026-06-25T08:00:00.000Z",
    "updatedAt": "2026-06-25T09:00:00.000Z"
  }
}
```

### Reorder Tasks

**Method:** `PATCH`

**Path:** `/tasks/reorder`

**Request body:**

```json
{
  "taskIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

`taskIds` must include valid task IDs in the desired order.

**Response shape:**

```json
{
  "data": [
    {
      "id": "uuid-1",
      "title": "First task",
      "description": "",
      "dueDate": null,
      "completed": false,
      "order": 0,
      "createdAt": "2026-06-25T08:00:00.000Z",
      "updatedAt": "2026-06-25T09:00:00.000Z"
    }
  ],
  "meta": {
    "active": 1,
    "completed": 0,
    "total": 1
  }
}
```

### Delete Task

**Method:** `DELETE`

**Path:** `/tasks/:id`

**Request body:** None

**Response shape:** `204 No Content`

### Error Response

```json
{
  "error": "Task not found."
}
```

## Project Structure

```text
.
|-- client
|   |-- src
|   |   |-- components
|   |   |   |-- EmptyState.jsx     # Empty list UI and add-task CTA
|   |   |   |-- FilterTabs.jsx     # All, active, completed filter controls
|   |   |   |-- TaskForm.jsx       # Quick-add task form
|   |   |   `-- TaskItem.jsx       # Task row, edit mode, drag handle, actions
|   |   |-- api.js                 # Frontend API client
|   |   |-- App.jsx                # Main app state, filtering, reordering, layout
|   |   |-- main.jsx               # React entry point
|   |   `-- styles.css             # Tailwind imports and shared component styles
|   |-- index.html
|   |-- package.json
|   |-- postcss.config.js
|   |-- tailwind.config.js
|   `-- vite.config.js
|-- server
|   |-- data
|   |   `-- tasks.json             # Local JSON persistence
|   |-- src
|   |   |-- app.js                 # Express routes and API behavior
|   |   |-- server.js              # Server startup and port handling
|   |   |-- storage.js             # JSON file read/write helper
|   |   `-- validators.js          # Request validation and filtering helpers
|   |-- test
|   |   `-- tasks.test.js          # API tests
|   `-- package.json
|-- package.json                  # Workspace scripts
|-- package-lock.json
`-- README.md
```

## Next Steps

I chose not to add authentication because the exercise assumes a single user, and I kept JSON-file persistence to avoid adding database setup for reviewers. I also have not deployed the app yet, so the live demo links are currently unavailable.

With more time, I would deploy the frontend and API, add frontend component tests, add pagination for very large task lists, add priority labels or tags, and replace JSON storage with a production database such as PostgreSQL.
