import appRouter from './router.js'
import {
    addCartController,
    addProductToCartController,
    deleteCartController,
    deleteProductInCartController,
    getCartController,
    getPurchaseController,
    updateProductToCartController,
    updatedCartController,
} from '../controllers/carts.controller.js'

export default class CartsRouter extends appRouter {
    // Método para inicializar las rutas del carrito
    init() {
        // Ruta para agregar un carrito nuevo
        this.post('/', ['USER', 'ADMIN', 'PREMIUM'], addCartController)

        // Ruta para agregar un producto a un carrito existente
        this.post('/:cid/product/:pid', ['USER', 'PREMIUM'], addProductToCartController)

        // Ruta para obtener un carrito específico
        this.get('/:cid', ['USER', 'ADMIN', 'PREMIUM'], getCartController)

        // Ruta para actualizar la cantidad de un producto en un carrito
        this.put('/:cid/product/:pid', ['USER', 'ADMIN', 'PREMIUM'], updateProductToCartController)

        // Ruta para actualizar la información de un carrito
        this.put('/:cid', ['USER', 'ADMIN', 'PREMIUM'], updatedCartController)

        // Ruta para eliminar un carrito
        this.delete('/:cid', ['USER', 'ADMIN', 'PREMIUM'], deleteCartController)

        // Ruta para eliminar un producto de un carrito
        this.delete('/:cid/product/:pid', ['USER', 'PREMIUM'], deleteProductInCartController)

        // Ruta para obtener la lista de productos comprados de un carrito
        this.get('/:cid/purchase', ['USER', 'PREMIUM'], getPurchaseController)
    }
}
