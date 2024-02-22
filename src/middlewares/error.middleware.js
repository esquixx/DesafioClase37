// Middleware para el manejo de errores en la aplicación
import EErrors from '../services/errors/enums.js'

// Función middleware que recibe el error, la solicitud, la respuesta y la siguiente función middleware
export default (error, req, res, next) => {
    // Imprimir la causa del error en la consola
    console.log(error.cause)

    // Seleccionar el código de error para determinar cómo manejarlo
    switch (error.code) {
        // Si el error es debido a tipos de datos inválidos, enviar una respuesta de estado 400 con el nombre del error
        case EErrors.INVALID_TYPES_ERROR:
            res.status(400).json({ status: 'error', error: error.name })
            break

        // Si el error es debido a un producto o carrito no encontrado, enviar una respuesta de estado 404 con el nombre del error
        case EErrors.INVALID_PRODUCT:
        case EErrors.INVALID_CART:
            res.status(404).json({ status: 'error', error: error.name })
            break

        // Para cualquier otro error no manejado, enviar una respuesta de estado 500 con un mensaje genérico de error
        default:
            res.status(500).json({ status: 'error', error: 'Unresolved error' })
            break
    }
}
