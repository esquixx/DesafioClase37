import { updatedUserRoleController } from '../controllers/users.controller.js'
import appRouter from './router.js'

// Clase que define una ruta para actualizar el rol de usuario a premium
export default class UsersRouter extends appRouter {
    // Método para inicializar la ruta y el controlador asociado
    init() {

        // Ruta para actualizar el rol de usuario a premium (requerida para usuarios y usuarios premium)
        this.post('/premium/:uid', ['USER', 'PREMIUM'], updatedUserRoleController)
    }
}
