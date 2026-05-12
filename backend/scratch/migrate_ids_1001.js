
import { sequelize } from '../src/config/db.js';
async function migrate() {
  try {
    console.log('🚀 Iniciando migración de IDs a 1001/10001...');
    
    // Ventas -> 1001+
    const [v] = await sequelize.query('UPDATE "Ventas" SET "NoVenta" = CAST(1000 + "IdVenta" AS VARCHAR)');
    console.log('✅ Ventas actualizadas a 1001+');
    
    // Devoluciones -> 10001+
    const [d] = await sequelize.query('UPDATE "Devoluciones" SET "NoDevolucion" = CAST(10000 + "IdDevolucion" AS VARCHAR)');
    console.log('✅ Devoluciones actualizadas a 10001+');
    
  } catch (e) {
    console.error('❌ Error en migración:', e);
  } finally {
    process.exit(0);
  }
}
migrate();
