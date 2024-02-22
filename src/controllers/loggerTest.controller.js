// Importación del módulo de registro y de un registrador personalizado para el entorno de desarrollo
import logger, { devLogger } from '../utils/logger.js'

// Controlador para probar la funcionalidad del registro
export const loggerTestController = async (req, res) => {
    try {
        // Pruebas de varios niveles de registro
        logger.debug('Debug')   // Mensaje de depuración
        logger.http('Http')     // Mensaje HTTP
        logger.info('Info')     // Mensaje de información
        logger.warning('Warning')   // Mensaje de advertencia
        logger.error('Error')   // Mensaje de error
        logger.fatal('Fatal')   // Mensaje de fatalidad

        // Respuesta JSON para indicar que la prueba ha sido exitosa
        res.json({ status: 'success' })
    } catch (error) {
        // Si ocurre un error, se registra en el registrador de desarrollo y se envía una respuesta de error al cliente
        devLogger.fatal(error.message)
        res.status(500).json({ status: error.message })
    }
}
