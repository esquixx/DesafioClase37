// Importar el modelo de usuario
import { userModel } from '../models/users.model.js'

// Clase que representa el acceso a datos para los usuarios
export default class UserDAO {
    // Método para encontrar un usuario por las propiedades especificadas en el objeto user
    findOne = async (user) => await userModel.findOne(user)

    // Método para encontrar un usuario por su ID
    findById = async (id) => await userModel.findById(id).lean().exec()

    // Método para crear un nuevo usuario
    create = async (user) => await userModel.create(user)

    // Método para actualizar un usuario por su ID
    update = async (id, data) => await userModel.findByIdAndUpdate(id, data, { new: true })
}
