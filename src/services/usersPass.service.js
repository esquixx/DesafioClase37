import { UserPass } from '../dao/factory/factory.js'
import UserPasswordRepository from '../repositories/userPass.repository.js'

export const UserPasswordService = new UserPasswordRepository(new UserPass())

// Se instancia el servicio 'UserPasswordService' utilizando el repositorio de contraseñas de usuario, el cual se inicializa con una instancia de 'UserPass' (una implementación específica del DAO para las contraseñas de usuario)
