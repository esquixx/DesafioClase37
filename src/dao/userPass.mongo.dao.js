// Importar el modelo de contraseña de usuario 
import { userPasswordModel } from '../models/userPassword.model.js'

// Clase que representa el acceso a datos para las contraseñas de usuario
export default class UserPasswordDAO {
    // Método para crear una nueva entrada de contraseña de usuario
    create = async (email, token) => await userPasswordModel.create(email, token)

    // Método para encontrar una entrada de contraseña de usuario por token
    findOne = async (token) => await userPasswordModel.findOne(token)
}
