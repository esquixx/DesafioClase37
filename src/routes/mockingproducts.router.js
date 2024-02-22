import appRouter from './router.js'
import {
    createProductController,
    getProductsController
} from '../controllers/mockingproducts.controller.js'

// Clase que define rutas de prueba para operaciones CRUD de productos
export default class MockingProducts extends appRouter {
    // Método para inicializar las rutas y los controladores asociados
    init() {
        // Ruta para obtener todos los productos
        this.get('/', ['PUBLIC'], getProductsController)

        // Ruta para crear un nuevo producto
        this.post('/', ['PUBLIC'], createProductController)
    }
}
