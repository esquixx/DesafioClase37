import {
    CartService,
    purchaseService
} from '../services/carts.service.js'
import { ProductService } from '../services/products.service.js'
import { devLogger } from '../utils/logger.js'

// Controlador para agregar un carrito nuevo
export const addCartController = async (req, res) => {
    try {
        // Llama al servicio para agregar un nuevo carrito y espera el resultado
        const result = await CartService.addCart(req)

        // Envía una respuesta al cliente indicando que el recurso fue creado exitosamente
        res.createdSuccess(result)
    } catch (error) {
        // Manejo de errores
        devLogger.error(error)
        return res.sendServerError(error.message)
    }
}

// Controlador para agregar un producto a un carrito existente
export const addProductToCartController = async (req, res) => {
    try {
        // Obtener el ID del producto de los parámetros de la solicitud
        const pid = req.params.pid

        // Obtener el producto correspondiente al ID proporcionado
        const product = await ProductService.getById(pid)

        // Si el producto no existe, devolver un error de solicitud al cliente
        if (!product) {
            return res.sendRequestError('Invalid product')
        }

        // Obtener el ID del carrito de los parámetros de la solicitud
        const cid = req.params.cid

        // Obtener el carrito correspondiente al ID proporcionado
        const cart = await CartService.getCart(cid)

        // Si el carrito no existe, devolver un error de solicitud al cliente
        if (!cart) {
            return res.sendRequestError('Invalid cart')
        }

        // Verificar si el usuario es premium y si el producto pertenece al usuario
        const currentUser = req.user.user

        // Si el usuario es premium y el producto pertenece al usuario, devolver un error al cliente
        if (currentUser.role === 'premium' && product.owner === currentUser._id) {
            return res.sendUserError('Premium customers can add their own products to the cart.')
        }

        // Verificar si el producto ya existe en el carrito
        const existingProduct = cart.products.findIndex(item => item.product._id == pid)

        if (existingProduct !== -1) {
            // Si el producto existe en el carrito, incrementar la cantidad del producto existente
            cart.products[existingProduct].quantity += 1
        } else {
            // Si el producto no existe en el carrito, agregar el producto al carrito con cantidad 1
            const newProduct = {
                product: pid,
                quantity: 1,
            }
            cart.products.push(newProduct)
        }

        // Actualizar el carrito en la db con los cambios realizados
        const result = await CartService.updatedCart({ _id: cid }, cart)

        // Enviar una respuesta exitosa al cliente con el carrito actualizado
        return res.sendSuccess(result)
    } catch (error) {
        // Manejo de errores
        devLogger.error(error)
        return res.sendServerError(error.message)
    }
}

// Controlador para obtener un carrito específico
export const getCartController = async (req, res) => {
    try {
        // Obtener el ID del carrito de los parámetros de la solicitud
        const cartId = req.params.cid

        // Obtener el carrito correspondiente al ID proporcionado
        const result = await CartService.getCart(cartId)

        // Verificar si se encontró el carrito. Si el carrito no existe, devolver un error de solicitud al cliente
        if (!result) {
            return res.sendRequestError(`The cart with id ${cartId} doesn't exist`)
        }

        // Si se encontró el carrito, enviar una respuesta exitosa al cliente con el carrito
        return res.sendSuccess(result)
    } catch (error) {
        devLogger.error(error)
        return res.sendServerError(error.message)
    }
}

// Controlador para actualizar la cantidad de un producto en un carrito
export const updateProductToCartController = async (req, res) => {
    try {
        // Obtener el ID del carrito de los parámetros de la solicitud
        const cid = req.params.cid

        // Obtener el carrito correspondiente al ID proporcionado
        const cart = await CartService.getCart(cid)

        // Si el carrito no existe, devolver un error de solicitud al cliente
        if (!cart) {
            return res.sendRequestError('Invalid cart')
        }

        // Obtener el ID del producto de los parámetros de la solicitud
        const pid = req.params.pid

        // Verificar si el producto ya existe en el carrito
        const existingProduct = cart.products.findIndex(item => item.product._id == pid)

        // Si el producto no existe en el carrito, devolver un error de solicitud al cliente
        if (existingProduct === -1) {
            return res.sendRequestError('Invalid product')
        }

        // Obtener la cantidad del producto del cuerpo de la solicitud
        const quantity = req.body.quantity

        // Verificar si la cantidad es un número entero positivo. Si no lo es, devolver un error al cliente
        if (!Number.isInteger(quantity) || quantity < 0) {
            return res.sendUserError('The quantity must be a positive integer')
        }

        // Actualizar la cantidad del producto existente en el carrito
        cart.products[existingProduct].quantity = quantity

        // Actualizar el carrito en la db con la cantidad actualizada del producto
        const result = await CartService.updatedCart({ _id: cid }, cart)

        // Enviar una respuesta exitosa al cliente con el carrito actualizado
        return res.sendSuccess(result)
    } catch (error) {
        devLogger.error(error)
        return res.sendServerError(error.message)
    }
}

// Controlador para actualizar la información de un carrito
export const updatedCartController = async (req, res) => {
    try {
        // Obtener el ID del carrito de los parámetros de la solicitud
        const cid = req.params.cid

        // Obtener el carrito correspondiente al ID proporcionado
        const cart = await CartService.getCart(cid)

        // Si el carrito no existe, devolver un error de solicitud al cliente
        if (!cart) {
            return res.sendRequestError('Invalid cart')
        }

        // Obtener la lista de productos enviada en el cuerpo de la solicitud
        const products = req.body.products

        // Verificar si la lista de productos es un array. Si no es un array, devolver un error al cliente
        if (!Array.isArray(products)) {
            return res.sendUserError('The format of the product array is invalid')
        }

        // Actualizar los productos del carrito con la lista enviada
        cart.products = products

        // Actualizar el carrito en la db
        const result = await CartService.updatedCart({ _id: cid }, cart)

        // Enviar una respuesta exitosa al cliente con el carrito actualizado
        return res.sendSuccess(result)
    } catch (error) {
        // Manejo de errores
        devLogger.error(error)
        return res.sendServerError(error.message)
    }
}

// Controlador para eliminar un carrito
export const deleteCartController = async (req, res) => {
    try {
        // Obtener el ID del carrito de los parámetros de la solicitud
        const cid = req.params.cid

        // Eliminar el carrito utilizando el servicio correspondiente
        const result = await CartService.deleteCart(cid)

        // Verificar si el carrito fue eliminado con éxito, si fue eliminado con éxito significa que el carrito no existe y devuelve un error de solicitud al cliente
        if (!result) {
            return res.sendRequestError('Invalid cart')
        }

        // Si el carrito fue eliminado correctamente, enviar una respuesta exitosa al cliente
        res.sendSuccess(result)
    } catch (error) {
        // Manejo de errores
        devLogger.error(error)
        return res.sendServerError(error.message)
    }
}

// Controlador para eliminar un producto de un carrito
export const deleteProductInCartController = async (req, res) => {
    try {
        // Obtener el ID del carrito y el ID del producto a eliminar de los parámetros de la solicitud
        const cid = req.params.cid
        const pid = req.params.pid

        // Obtener el carrito correspondiente al ID proporcionado
        const cart = await CartService.getCart(cid)

        // Si el carrito no existe, devolver un error de solicitud al cliente
        if (!cart) {
            return res.sendRequestError('Invalid cart')
        }

        // Verificar si el producto existe en el carrito
        const existingProduct = cart.products.findIndex(item => item.product._id == pid)

        // Si el producto no existe en el carrito, devolver un error de solicitud al cliente
        if (existingProduct === -1) {
            return res.sendRequestError('Invalid product')
        }

        // Eliminar el producto del carrito
        cart.products.splice(existingProduct, 1)

        // Actualizar el carrito en la db con el producto eliminado
        await CartService.updatedCart({ _id: cid }, cart)

        // Obtener el carrito actualizado después de la eliminación del producto
        const updatedCart = await CartService.getCart(cid)

        // Enviar una respuesta exitosa al cliente con el carrito actualizado
        res.sendSuccess(updatedCart)
    } catch (error) {
        // Manejo de errores
        devLogger.error(error)
        return res.sendServerError(error.message)
    }
}

// Controlador para obtener la lista de compras del usuario
export const getPurchaseController = async (req, res) => {
    try {
        // Llamar al servicio de compras para obtener la lista de compras del usuario
        const result = await purchaseService(req, res)
        // Devolver el resultado de la consulta
        return result
    } catch (error) {
        // Registrar el error en el logger
        devLogger.error(error)

        // Devolver un error al cliente con el mensaje del error
        return res.sendServerError(error.message)
    }
}
