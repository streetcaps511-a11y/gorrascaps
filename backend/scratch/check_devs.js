
import { sequelize } from '../src/config/db.js';
async function check() {
  try {
    const [r] = await sequelize.query('SELECT "IdDevolucion", "NoDevolucion" FROM "Devoluciones" LIMIT 5');
    console.log('Devoluciones:', JSON.stringify(r, null, 2));
  } catch (e) { console.error(e); }
  finally { process.exit(0); }
}
check();
