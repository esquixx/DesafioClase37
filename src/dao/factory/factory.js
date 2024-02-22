// Importaciones de los DAO específicos para MongoDB
import { PERSISTENCE } from '../../config/config.js'

// Declaración de variables para almacenar los DAO correspondientes
export let Product
export let Cart
export let Chat
export let User
export let UserPass

// Selección del tipo de persistencia de datos
switch (PERSISTENCE) {
    // Caso de persistencia en MongoDB
    case 'MONGO':
        // Importación dinámica de los DAO para MongoDB
        const { default: ProductDAO } = await import('../products.mongo.dao.js')
        const { default: CartDAO } = await import('../carts.mongo.dao.js')
        const { default: UserDAO } = await import('../users.mongo.dao.js')
        const { default: UserPassDAO } = await import('../userPass.mongo.dao.js')
        const { default: ChatDAO } = await import('../chats.mongo.dao.js')

        // Asignación de los DAO importados a las variables correspondientes
        Product = ProductDAO
        Cart = CartDAO
        User = UserDAO
        UserPass = UserPassDAO
        Chat = ChatDAO

        break

    // Manejo de casos no especificados (en este caso, no hay ninguna acción)
    default:
        break
}
