// Clase que representa un repositorio para la gestión de usuarios en la db
export default class UserRepository {
    constructor(dao) {
        // Inicializa el DAO asociado al repositorio
        this.dao = dao
    }
    
    // Método para encontrar un usuario en la db por sus atributos
    findOne = async (user) => await this.dao.findOne(user)

    // Método para encontrar un usuario en la db por su identificador único
    findById = async (id) => await this.dao.findById(id)

    // Método para crear un nuevo usuario en la db
    create = async (user) => await this.dao.create(user)

    // Método para actualizar un usuario en la db por su identificador único
    update = async (id, data) => await this.dao.update(id, data)
}
