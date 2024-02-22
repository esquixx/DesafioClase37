import appRouter from './router.js'
import {
    getCartViewController,
    getChatController,
    getProductsByIdViewController,
    getProductsViewsController,
    getRealTimeProductsController
} from '../controllers/views.controller.js'

// Clase que define rutas para las vistas relacionadas con productos
export default class ViewsProductsRouter extends appRouter {
    // Método para inicializar las rutas y los controladores asociados
    init() {

        // Ruta para mostrar la lista de productos (accesible para usuarios, administradores y usuarios premium)
        this.get('/', ['USER', 'ADMIN', 'PREMIUM'], getProductsViewsController)

        // Ruta para mostrar la vista de productos en tiempo real (accesible para administradores y usuarios premium)
        this.get('/realTimeProducts', ['ADMIN', 'PREMIUM'], getRealTimeProductsController)

        // Ruta para mostrar la vista del chat (accesible para usuarios y usuarios premium)
        this.get('/chat', ['USER', 'PREMIUM'], getChatController)

        // Ruta para mostrar detalles de un producto específico (accesible para usuarios, administradores y usuarios premium)
        this.get('/product/:pid', ['USER', 'ADMIN', 'PREMIUM'], getProductsByIdViewController)

        // Ruta para mostrar el carrito de compras de un usuario específico (accesible para usuarios, administradores y usuarios premium)
        this.get('/carts/:cid', ['USER', 'ADMIN', 'PREMIUM'], getCartViewController)
    }
}
