import appRouter from './router.js'
import { uploader } from '../utils/utils.js'
import {
    addProductsController,
    deleteProductsController,
    getProductsByIdController,
    getProductsController,
    updateProductsController,
} from '../controllers/products.controller.js'

// Clase que define rutas para operaciones CRUD de productos
export default class ProductsRouter extends appRouter {
    // Método para inicializar las rutas y los controladores asociados
    init() {

        // Ruta para obtener todos los productos (requerida para usuarios, administradores y usuarios premium)
        this.get('/', ['USER', 'ADMIN', 'PREMIUM'], getProductsController)

        // Ruta para obtener un producto por su ID (requerida para usuarios, administradores y usuarios premium)
        this.get('/:pid', ['USER', 'ADMIN', 'PREMIUM'], getProductsByIdController)

        // Ruta para agregar un nuevo producto (requerida solo para administradores y usuarios premium)
        this.post('/', ['ADMIN', 'PREMIUM'], uploader.single('file'), addProductsController)

        // Ruta para actualizar un producto por su ID (requerida solo para administradores y usuarios premium)
        this.put('/:pid', ['ADMIN', 'PREMIUM'], updateProductsController)

        // Ruta para eliminar un producto por su ID (requerida solo para administradores y usuarios premium)
        this.delete('/:pid', ['ADMIN', 'PREMIUM'], deleteProductsController)
    }
}
