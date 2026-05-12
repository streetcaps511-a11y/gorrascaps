
import { sequelize } from '../src/config/db.js';
async function check() {
  try {
    const [v] = await sequelize.query('SELECT "NoVenta" FROM "Ventas" WHERE "NoVenta" LIKE \'%100%\' OR "NoVenta" LIKE \'%101%\'');
    console.log('Ventas with 100/101:', v);
    const [d] = await sequelize.query('SELECT "NoDevolucion" FROM "Devoluciones"');
    console.log('Devoluciones:', d);
  } catch (e) { console.error(e); }
  finally { process.exit(0); }
}
check();
