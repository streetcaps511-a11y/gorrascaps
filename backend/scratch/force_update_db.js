
import { sequelize } from '../src/config/db.js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function update() {
  try {
    console.log('--- DB UPDATE START ---');
    
    // Ventas
    const [v] = await sequelize.query('UPDATE "Ventas" SET "NoVenta" = CAST(100 + "IdVenta" - 1 AS VARCHAR)');
    console.log('Ventas updated rows:', v);

    // Compras
    const [c] = await sequelize.query('UPDATE "Compras" SET "NoCompra" = CAST(100 + "IdCompra" - 1 AS VARCHAR)');
    console.log('Compras updated rows:', c);

    // Devoluciones
    const [d] = await sequelize.query('UPDATE "Devoluciones" SET "NoDevolucion" = CAST(100 + "IdDevolucion" - 1 AS VARCHAR)');
    console.log('Devoluciones updated rows:', d);

    // Verify
    const [verify] = await sequelize.query('SELECT "IdVenta", "NoVenta" FROM "Ventas" ORDER BY "IdVenta" ASC LIMIT 5');
    console.log('Verification (Ventas):', verify);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

update();
