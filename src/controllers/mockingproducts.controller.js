// Importación de funciones para crear productos falsos y el registrador de desarrollo
import { 
    createProduct, 
    generateProduct 
} from '../services/fakeProducts.js'
import { devLogger } from '../utils/logger.js'

// Arreglo para almacenar los productos
const products = []

// Controlador para obtener una lista de productos
export const getProductsController = async (req, res) => {
    try {
        // Generar 100 productos falsos y agregarlos al array de productos
        for (let i = 0; i < 100; i++) {
            products.push(await generateProduct())
        }

        // Enviar una respuesta de éxito con la lista de productos
        res.sendSuccess(products)
    } catch (error) {
        // Si ocurre un error, registrar el error y enviar una respuesta de error al cliente
        devLogger.error(error)
        return res.sendServerError(error.message)
    }
}

// Controlador para crear un nuevo producto
export const createProductController = async (req, res, next) => {
    try {
        // Crear un nuevo producto utilizando los datos proporcionados en la solicitud
        const product = await createProduct(req)

        // Agregar el nuevo producto al array de productos
        products.push(product)

        // Enviar una respuesta de éxito con el array actualizado de productos
        res.createdSuccess(products)
    } catch (error) {
        // Si ocurre un error, pasar el error al siguiente middleware para su manejo
        next(error)
    }
}
