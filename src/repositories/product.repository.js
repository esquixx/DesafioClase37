// Clase que representa un repositorio para la gestión de productos en la db
export default class ProductRepository {
    constructor(dao) {
        // Inicializa el DAO asociado al repositorio
        this.dao = dao
    }

    // Método para obtener todos los productos de la base de datos
    getAll = async () => await this.dao.getAll()

    // Método para obtener todos los productos paginados de la db según un filtro y opciones
    getAllPaginate = async (filter, options) => await this.dao.getAllPaginate(filter, options)

    // Método para obtener un producto de la db por su identificador único
    getById = async (id) => await this.dao.getById(id)

    // Método para crear un nuevo producto en la db
    create = async (data) => await this.dao.create(data)

    // Método para actualizar un producto en la db por su identificador único
    update = async (id, data) => await this.dao.update(id, data, { new: true })

    // Método para eliminar un producto de la db por su identificador único
    delete = async (id) => await this.dao.delete(id)
}
