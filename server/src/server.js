import { createApp } from './app.js';

const port = process.env.PORT || 4000;
const app = createApp();

const server = app.listen(port, () => {
  console.log(`Task manager API listening on http://localhost:${port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Task manager API is already running on http://localhost:${port}`);
    process.exit(0);
  }

  throw error;
});
