import { sequelize } from '../src/config/db.js';

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');
    await sequelize.query('ALTER TABLE "Productos" ADD COLUMN IF NOT EXISTS "IdProductoRef" BIGINT');
    console.log('✅ Columna IdProductoRef asegurada en tabla Productos');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error asegurando IdProductoRef:', error);
    process.exit(1);
  }
};

run();
