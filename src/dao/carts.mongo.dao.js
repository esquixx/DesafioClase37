// Importación del modelo de carrito y del modelo de ticket
import { cartModel } from '../models/carts.model.js'
import { ticketModel } from '../models/tickets.model.js'

// Clase que encapsula las operaciones de acceso a datos relacionadas con los carritos
export default class CartDAO {
    // Método para agregar un nuevo carrito
    addCart = async (cart) => await cartModel.create(cart)

    // Método para actualizar la información de un carrito
    updatedCart = async (filter, update) => await cartModel.findOneAndUpdate(filter, update, { returnOriginal: false })

    // Método para obtener un carrito por su ID
    getCart = async (id) => await cartModel.findById(id).lean().exec()

    // Método para eliminar un carrito por su ID
    deleteCart = async (id) => await cartModel.findByIdAndUpdate(id, { products: [] }, { new: true }).lean().exec()

    // Método para crear un nuevo registro de carrito
    create = async (cart) => await cartModel.create(cart)

    // Método para crear un nuevo registro de compra
    createPurchase = async (ticket) => await ticketModel.create(ticket)

    // Método para obtener los detalles de una compra por su ID
    getPurchase = async (id) => await ticketModel.findById(id).lean().exec()
}
