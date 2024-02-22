import {
    ProductService,
    getProductsService
} from '../services/products.service.js'
import { CartService } from '../services/carts.service.js'
import { ChatService } from '../services/chats.service.js'
import { devLogger } from '../utils/logger.js'

// Controlador para recuperar las vistas de productos
export const getProductsViewsController = async (req, res) => {
    try {
        // Recupera los productos usando el servicio
        const products = await getProductsService(req)

        // Verifica el stck de cada producto y ajusta su estado
        for (const product of products.payload) {
            product.stock === 0 ? product.status = false : product.status = true
            // Actualiza el estado del producto en la db
            await ProductService.update(product._id, { status: product.status })
        }

        // Variables para mostrar u ocultar botones de acciones en la vista
        const user = req.user.user
        let userAdmin
        let onlyUser
        let userPremium

        // Verifica el rol del usuario para el control de acceso
        if (user) {
            userAdmin = user?.role === 'admin' ? true : false
            onlyUser = (user?.role === 'user' || user?.role === 'premium') ? true : false
            userPremium = user?.role === 'premium' ? true : false
        }

        // Renderiza la vista de productos con las variables necesarias
        res.render('products', { products, user, userAdmin, onlyUser, userPremium })
    } catch (error) {
        devLogger.error(error)
        return res.sendServerError(error)
    }
}

// Controlador para obtener productos en tiempo real
export const getRealTimeProductsController = async (req, res) => {
    try {
        // Obtiene los productos usando el servicio
        const result = await getProductsService(req)
        const allProducts = result.payload

        // Renderiza la vista de productos en tiempo real
        res.render('realTimeProducts', { allProducts: allProducts })
    } catch (error) {
        devLogger.error(error)
        return res.sendServerError(error)
    }
}

// Controlador para obtener el chat
export const getChatController = async (req, res) => {
    try {
        // Obtiene los mensajes del servicio de chat
        const messages = await ChatService.getMessages()

        // Renderiza la vista del chat
        res.render('chat', { messages })
    } catch (error) {
        devLogger.error(error)
        return res.sendServerError(error)
    }
}

// Controlador para obtener la vista de un producto por su ID
export const getProductsByIdViewController = async (req, res) => {
    try {
        // Obtiene el ID del producto de los parámetros de la solicitud
        const pid = req.params.pid

        // Busca el producto por su ID utilizando el servicio
        const product = await ProductService.getById(pid)

        // Si no se encuentra el producto, renderiza la página de error
        if (!product) {
            return res.render('errors/errorPage', { error: 'The product does not exist' })
        }

        // Verifica el rol del usuario para definir los permisos
        const user = req.user.user
        let userAdmin
        let onlyUser
        let userPremium

        if (user) {
            userAdmin = user?.role === 'admin' ? true : false
            onlyUser = (user?.role === 'user' || user?.role === 'premium') ? true : false
            userPremium = user?.role === 'premium' ? true : false
        }

        // Renderiza la vista del producto con los detalles y los permisos del usuario
        res.render('product', { product, user, userAdmin, onlyUser, userPremium })
    } catch (error) {
        devLogger.error(error)
        return res.sendServerError(error)
    }
}

// Controlador para obtener y mostrar el carrito del usuario
export const getCartViewController = async (req, res) => {
    try {
        // Obtener el ID del carrito desde los parámetros de la solicitud
        const cid = req.params.cid

        // Obtener el carrito utilizando el servicio CartService
        const cart = await CartService.getCart(cid)

        // Verificar si ocurrió un error al obtener el carrito
        if (cart.status === 'error') {
            return res.sendRequestError(cart.message)
        }

        // Verificar si el carrito está vacío
        if (cart === null || cart.products.length === 0) {
            // Si el carrito está vacío, renderizar la vista con un mensaje de carrito vacío
            const emptyCart = 'Cart Empty'

            // Emitir un evento para actualizar los carritos en tiempo real utilizando socket.io
            req.app.get('socketio').emit('updatedCarts', cart.products)
            return res.render('carts', { emptyCart })
        }

        // Si el carrito tiene productos, obtener los productos del carrito
        const carts = cart.products

        // Emitir un evento para actualizar los carritos en tiempo real utilizando socket.io
        req.app.get('socketio').emit('updatedCarts', carts)

        // Renderizar la vista de carritos con los productos del carrito
        res.render('carts', { carts })
    } catch (error) {
        devLogger.error(error)
        return res.sendServerError(error)
    }
}
