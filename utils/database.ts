import { Client } from 'pg';

export class DatabaseUtil {
  private client: Client;

  constructor(config: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  }) {
    this.client = new Client(config);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async read(query: string, params?: any[]): Promise<any[]> {
    const res = await this.client.query(query, params);
    return res.rows;
  }

  async write(query: string, params?: any[]): Promise<void> {
    await this.client.query(query, params);
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }
}

// Example usage:
// const db = new DatabaseUtil({
//   host: 'localhost',
//   port: 5432,
//   user: 'username',
//   password: 'password',
//   database: 'mydb'
// });
// await db.connect();
// const rows = await db.read('SELECT * FROM users WHERE id = $1', [1]);
// await db.write('INSERT INTO users (name) VALUES ($1)', ['John']);
// await db.disconnect();