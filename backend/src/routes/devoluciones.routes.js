/* === RUTAS DE BACKEND === 
   Define las URLs expuestas de la API para este módulo. 
   Aplica los middlewares de protección (como la validación de tokens JWT) antes de ceder el control al Controlador. */

// routes/devoluciones.routes.js
import express from 'express';
const router = express.Router();
import devolucionController from '../controllers/devoluciones.controller.js';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware.js';

/**
 * Módulo de Devoluciones (Garantías)
 */

// 1. JWT Global
router.use(verifyToken);

// 2. Rutas Específicas
router.get('/mis-devoluciones', devolucionController.getMisDevoluciones);
router.get('/estadisticas', checkPermission('ver_devoluciones'), devolucionController.getEstadisticas);
router.get('/venta/:ventaId', checkPermission('ver_devoluciones'), devolucionController.getDevolucionesByVenta);
router.get('/producto/:productoId', checkPermission('ver_devoluciones'), devolucionController.getDevolucionesByProducto);

// 3. CRUD Estándar
router.get('/', checkPermission('ver_devoluciones'), devolucionController.getAllDevoluciones);
router.get('/:id', checkPermission('ver_devoluciones'), devolucionController.getDevolucionById);

// Permitir crear a admin con permiso o a cualquier Cliente/Usuario autenticado
router.post('/', (req, res, next) => {
    const rolName = String(req.rol?.nombre || '').toLowerCase();
    // Clientes y usuarios normales pueden crear devoluciones directamente
    if (rolName.includes('cliente') || rolName.includes('usuario')) {
        return next();
    }
    // Admins y otros roles requieren el permiso específico
    return checkPermission('crear_devoluciones')(req, res, next);
}, devolucionController.createDevolucion);

router.put('/:id', checkPermission('editar_devoluciones'), devolucionController.updateDevolucion);
router.delete('/:id', checkPermission('eliminar_devoluciones'), devolucionController.deleteDevolucion);
router.patch('/:id/estado', checkPermission('editar_devoluciones'), devolucionController.toggleDevolucionStatus);

export default router;