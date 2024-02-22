import { ProductService } from '../services/products.service.js'
import { devLogger } from '../utils/logger.js'

// Controlador para obtener todos los productos
export const getProductsController = async (req, res) => {
    try {
        // Obtiene todos los productos utilizando el servicio ProductService
        const result = await ProductService.getAll()

        // Envia una respuesta HTTP exitosa con los productos
        return res.sendSuccess(result)
    } catch (error) {
        // Manejo de errores
        devLogger.error(error)
        return res.sendServerError(error.message)
    }
}

// Controlador para obtener un producto por su ID
export const getProductsByIdController = async (req, res) => {
    try {
        // Obtiene el ID del producto de los parámetros de la solicitud
        const pid = req.params.pid

        // Obtiene el producto por su ID utilizando el servicio ProductService
        const result = await ProductService.getById(pid)

        // Si el producto no existe, envía una respuesta HTTP con un error de solicitud 
        if (!result) {
            return res.sendRequestError(`The product doesn't exist`)
        }

        // Si elproducto existe, envía una respuesta HTTP exitosa con el producto encontrado
        res.sendSuccess(result)
    } catch (error) {
        devLogger.error(error)
        res.sendServerError(error.message)
    }
}

// Controlador para agregar un nuevo producto
export const addProductsController = async (req, res) => {
    try {
        // Verifica si se ha subido una imagen para el producto 
        if (!req.file) {
            devLogger.info('No image provided')     // Registra un mensaje informativo en el logger si no se proporciona una imagen
        }

        // Verifica si se han proporcionado datos para crear el producto
        if (!req.body) {
            // Envía un error al usuario si no se proporcionan propiedades para el producto
            return res.sendUserError(`The product can't be created without properties`)
        }

        // Crea un objeto de producto con los datos proporcionados en la solicitud
        let product = {
            title: req.body.title,
            description: req.body.description,
            price: parseFloat(req.body.price),
            thumbnails: [req?.file?.originalname] || [],    // Establece la imagen del producto como la imagen subida en la solicitud
            code: req.body.code,
            category: req.body.category,
            stock: parseInt(req.body.stock),
        }

        // Establece el dueño del producto como 'admin' si no se proporciona un usuario o si el usuario no es premium
        product.owner = req.user.user && req.user.user.role === 'premium' ? req.user.user._id : 'admin'

        // Crea el producto utilizando el servicio ProductService
        const result = await ProductService.create(product)

        // Obtiene todos los productos actualizados después de agregar el nuevo producto
        const products = await ProductService.getAll()
        
        // Emite un evento de socket para notificar a los clientes sobre la actualización de los productos
        req.app.get("socketio").emit("updatedProducts", products)

        // Envia una respuesta HTTP con el producto creado
        res.createdSuccess(result)
    } catch (error) {
        devLogger.error(error.message)
        return res.sendServerError(error.message)
    }
}

// Controlador para actualizar un producto en la db
export const updateProductsController = async (req, res) => {
    try {
        // Obtener el ID del producto de los parámetros de la solicitud
        const pid = req.params.pid

        // Obtener los datos actualizados del producto del cuerpo de la solicitud
        const updated = req.body

        // Buscar el producto en la db por su ID
        const productFind = await ProductService.getById(pid)

        // Si no se encuentra el producto, devolver un error
        if (!productFind) {
            return sendRequestError(`The product doesn't exist`)
        }

        // Verificar si el usuario no es un administrador y si el producto no le pertenece
        if (req.user.user.role !== 'admin' && productFind?.owner !== req.user.user._id) {
            return res.sendUserError(`You don't have permission to update this product`)
        }

        // Verificar si el ID del producto actualizado coincide con el ID original del producto
        if (updated._id === pid) {
            return res.sendUserError(`Can't modify product ID`)
        }

        // Actualizar el producto con los datos proporcionados
        await ProductService.update(pid, updated)

        // Obtener todos los productos después de la actualización
        const products = await ProductService.getAll()

        // Emitir un evento de socket para informar a los clientes sobre los productos actualizados
        req.app.get('socketio').emit('updatedProducts', products)

        // Enviar una respuesta exitosa con los productos actualizados
        res.sendSuccess(products)
    } catch (error) {
        devLogger.error(error)
        res.sendServerError(error)
    }
}

// Controlador para eliminar productos de la db
export const deleteProductsController = async (req, res) => {
    try {
        // Obtener el ID del producto de los parámetros de la solicitud
        const pid = req.params.pid

        // Buscar el producto en la db utilizando su ID
        const product = await ProductService.getById(pid)

        // Verificar si el producto no existe
        if (!product) {
            return res.sendRequestError(`No such product with id: ${pid}`)
        }

        // Verificar si el usuario no es un administrador y el producto no le pertenece
        if (req.user.user.role !== 'admin' && product?.owner !== req.user.user._id) {
            return res.sendUserError('You are not authorized to delete this product')
        }

        // Si hemos llegado a este punto, significa que el usuario es un administrador o que el producto le pertenece
        const result = await ProductService.delete(pid)

        // Verificar si el producto se eliminó correctamente
        if (!result) {
            return res.sendRequestError(`No such product with id: ${pid}`)
        }

        // Actualizar la lista de productos después de la eliminación
        const products = await ProductService.getAll()
        
        // Emitir un evento para actualizar productos a través del socket
        req.app.get('socketio').emit('updatedProducts', products)

        // Enviar respuesta exitosa con la lista actualizada de productos
        res.sendSuccess(products)
    } catch (error) {
        devLogger.error(error)
        return res.sendServerError(error.message)
    }
}
