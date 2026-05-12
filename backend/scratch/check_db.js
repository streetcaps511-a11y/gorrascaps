
import { sequelize } from '../src/config/db.js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function check() {
  try {
    console.log('--- DB CHECK ---');
    const [tables] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables found:', tables.map(t => t.table_name));

    const targetTables = ['Ventas', 'Compras', 'Devoluciones'];
    for (const t of targetTables) {
      console.log(`Checking table: ${t}`);
      const [cols] = await sequelize.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${t}'`);
      console.log(`Columns in ${t}:`, cols.map(c => c.column_name));
      
      if (t === 'Ventas') {
          const [data] = await sequelize.query(`SELECT "IdVenta", "NoVenta" FROM "Ventas" LIMIT 5`);
          console.log(`Data in Ventas (first 5):`, data);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

check();
