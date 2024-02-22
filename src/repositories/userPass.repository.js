// Clase que representa un repositorio para la gestión de contraseñas de usuario en la db
export default class UserPasswordRepository {
    constructor(dao) {
        // Inicializa el DAO asociado al repositorio
        this.dao = dao
    }

    // Método para crear una nueva entrada de contraseña de usuario en la db
    create = async (email, token) => await this.dao.create(email, token)

    // Método para encontrar una entrada de contraseña de usuario en la db por su token
    findOne = async (token) => await this.dao.findOne(token)
}
