import appRouter from './router.js'
import { loggerTestController } from '../controllers/loggerTest.controller.js'

// Clase que define una ruta para probar el registro de eventos en el logger
export default class LoggerTest extends appRouter {
    // Método para inicializar la ruta y el controlador asociado
    init() {
        // Ruta para realizar pruebas del logger
        this.get('/', ['PUBLIC'], loggerTestController)
    }
}
