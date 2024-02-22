// Repositorio para manipular la información de los carritos
export default class CartRepository {
    constructor(dao) {
        // Inicialización del DAO (Data Access Object)
        this.dao = dao
    }

    // Método para agregar un nuevo carrito
    addCart = async (cart) => await this.dao.addCart(cart)

    // Método para obtener un carrito por su ID
    getCart = async (id) => await this.dao.getCart(id)

    // Método para actualizar la información de un carrito
    updatedCart = async (filter, update) => await this.dao.updatedCart(filter, update)

    // Método para eliminar un carrito por su ID
    deleteCart = async (id) => await this.dao.deleteCart(id)

    // Método para crear un nuevo registro de carrito
    create = async (cart) => await this.dao.create(cart)

    // Método para crear un nuevo registro de compra
    createPurchase = async (ticket) => await this.dao.createPurchase(ticket)

    // Método para obtener los detalles de una compra por su ID
    getPurchase = async (id) => await this.dao.getPurchase(id)
}
