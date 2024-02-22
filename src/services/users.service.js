import { User } from '../dao/factory/factory.js'
import UserRepository from '../repositories/user.repository.js'

export const UserService = new UserRepository(new User())
// Se instancia el servicio 'UserService' utilizando el repositorio de usuario, el cual se inicializa con una instancia de 'User' (una implementación específica del DAO para los datos de usuario)
