// Importar el modelo de productos
import { productModel } from '../models/products.model.js'

// Clase que representa el acceso a datos para los productos
export default class ProductDAO {
    // Método para obtener todos los productos
    getAll = async () => await productModel.find().lean().exec()

    // Método para obtener todos los productos paginados con filtros y opciones
    getAllPaginate = async (filter, options) => await productModel.paginate(filter, options)

    // Método para obtener un producto por su ID
    getById = async (id) => await productModel.findById(id).lean().exec()

    // Método para crear un nuevo producto
    create = async (data) => await productModel.create(data)

    // Método para actualizar un producto existente por su ID
    update = async (id, data) => await productModel.findByIdAndUpdate(id, data, { new: true })

    // Método para eliminar un producto por su ID
    delete = async (id) => await productModel.findByIdAndDelete(id)
}
