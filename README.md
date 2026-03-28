# Playwright Database Utility

This utility provides TypeScript classes for reading and writing to a PostgreSQL database in Playwright tests.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your PostgreSQL database and update the configuration in your test files.

## Usage

Import the `DatabaseUtil` class in your Playwright test files:

```typescript
import { DatabaseUtil } from './utils/database';

test('example test', async ({ page }) => {
  const db = new DatabaseUtil({
    host: 'localhost',
    port: 5432,
    user: 'username',
    password: 'password',
    database: 'mydb'
  });

  await db.connect();

  // Read data
  const users = await db.read('SELECT * FROM users');

  // Write data
  await db.write('INSERT INTO users (name) VALUES ($1)', ['John']);

  await db.disconnect();
});
```

## Troubleshooting

- Ensure PostgreSQL is running and accessible.
- Check database credentials.
- For TypeScript errors, run `npx tsc` to compile.