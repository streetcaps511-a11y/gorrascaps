import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Necesario para Aiven
      },
    },
    pool: {
      max: 5, // Reducido para evitar agotar conexiones en Aiven Free
      min: 0,
      acquire: 60000, // Aumentado a 60s para mayor resiliencia
      idle: 20000,   // Aumentado a 20s
    },
  }
);

console.log('⚡ Inicializando Sequelize para Aiven...');

export const connectDB = async () => {
  const maxRetries = 5;
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      await sequelize.authenticate();
      console.log('✅ Conexión a PostgreSQL (Aiven) establecida correctamente.');
      return;
    } catch (error) {
      attempt += 1;
      const waitMs = Math.min(16000, 1000 * Math.pow(2, attempt - 1));
      console.error(`❌ Intento ${attempt}/${maxRetries} - Error al conectar con la base de datos: ${error.message}`);
      if (attempt >= maxRetries) {
        console.error('❌ Número máximo de reintentos alcanzado.');
        throw error;
      }
      console.log(`➡️ Reintentando en ${waitMs} ms...`);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, waitMs));
    }
  }
};

export default { sequelize, connectDB };
