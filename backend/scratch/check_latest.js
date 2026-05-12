
import { sequelize } from '../src/config/db.js';
async function check() {
  try {
    const [r] = await sequelize.query('SELECT "IdVenta", "NoVenta" FROM "Ventas" ORDER BY "IdVenta" DESC LIMIT 5');
    console.log('Latest Ventas:', r);
  } catch (e) { console.error(e); }
  finally { process.exit(0); }
}
check();
