import { UserService } from '../services/users.service.js'
import { devLogger } from '../utils/logger.js'

// Controlador para actualizar el rol de un usuario
export const updatedUserRoleController = async (req, res) => {
    try {
        // ID de usuario desde los parámetros de la solicitud
        const uid = req.params.uid

        // Encuentra el usuario por su ID
        const user = await UserService.findById(uid)

        // Verificar si el usuario existe
        if (!user) {
            return res.sendRequestError('User not found')
        }

        // Verificar si el usuario es un administrador
        if (user.role === 'admin') {
            return res.sendUserError(`Admins can't change user roles`)
        }

        // Cambiar el rol del usuario de 'user' a 'premium' o viceversa
        user.role = user.role === 'user' ? 'premium' : 'user'

        // Actualizar el usuario con el nuevo rol
        const updatedUser = await UserService.update(uid, user)

        // Enviar una respuesta exitosa con el usuario actualizado
        res.sendSuccess(updatedUser)
    } catch (error) {
        devLogger.error(error.message)
        res.sendServerError(error.message)
    }
}
