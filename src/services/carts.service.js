import CartRepository from '../repositories/cart.repository.js'
import { Cart } from '../dao/factory/factory.js'
import { ProductService } from './products.service.js'
import { generateUniqueCode } from '../utils/utils.js'
import { sendEmailPurchase } from './nodemailer/mailer.js'
import { devLogger } from '../utils/logger.js'

// Crear una instancia del repositorio del carrito
export const CartService = new CartRepository(new Cart())

// Función para calcular el monto total del carrito
const calculateTotalAmount = async (cart) => {
    // Inicializar el monto total en 0
    let totalAmount = 0

    try {
        // Iterar sobre los elementos del carrito
        for (const item of cart) {
            // Obtener el producto correspondiente al ID del producto del elemento del carrito
            const product = await ProductService.getById(item.product)

            // Verificar si el producto existe. Si el producto no existe, lanzar un error
            if (!product) {
                throw new Error(`Product not found for id: ${item.product}`)
            }

            // Calcular el costo total del producto multiplicando el precio del producto por su cantidad en el carrito
            totalAmount += product.price * item.quantity
        }
    } catch (error) {
        // Manejar cualquier error que ocurra durante el cálculo del monto total del carrito
        devLogger.error(error.message)
    }

    // Redondear el monto total a 2 decimales y convertirlo a un número
    totalAmount = Number(totalAmount.toFixed(2))
    return totalAmount
}

// Servicio para procesar una compra en el carrito de compras
export const purchaseService = async (req, res) => {
    // Obtener el correo electrónico del usuario
    const userEmail = req.user.user.email

    // Obtener el ID del carrito de la solicitud
    const cid = req.params.cid

    // Obtener el carrito de compras correspondiente al ID
    const cart = await CartService.getCart(cid)

    // Verificar si el carrito existe
    if (!cart) {
        return res.sendRequestError(`The cart with id ${cid} doesn't exist`)
    }

    // Inicializar arrays para los productos a comprar y los productos a eliminar del carrito
    const productsToPurchase = []
    const productsToRemove = []

    // Recorrer cada producto en el carrito
    for (const productInfo of cart.products) {
        // Obtener información del producto desde la base de datos
        const product = await ProductService.getById(productInfo.product._id)

        // Verificar si el producto existe en la db. Si el producto no existe, agregarlo a la lista de productos a eliminar
        if (!product) {
            productsToRemove.push(productInfo.product._id)
            continue
        }

        // Verificar si el stock después de la compra es 0 y cambiar el estado si es necesario
        if (product.stock === 0) {
            product.status = false
            await ProductService.update(product._id, product)
        }

        // Verificar si hay suficiente stock para la cantidad deseada del producto
        if (product.stock >= productInfo.quantity) {
            // Si hay suficiente stock, restar la cantidad comprada del stock del producto
            product.stock -= productInfo.quantity
            
            await ProductService.update(product._id, product)

            // Agregar el producto a la lista de productos a comprar
            productsToPurchase.push(productInfo)
        }
    }

    // Verificar si se pudieron comprar productos
    if (productsToPurchase.length > 0) {
        // Crear un nuevo ticket con los detalles de la compra
        const newTicket = {
            code: generateUniqueCode(),
            purchase_datetime: new Date(),
            amount: await calculateTotalAmount(productsToPurchase),
            purchaser: userEmail,
            products: productsToPurchase.map(prod => ({
                product: prod.product._id,
                quantity: prod.quantity,
            })),
        }

        // Guardar el ticket de compra en la db
        const saveTicket = await CartService.createPurchase(newTicket)

        // Eliminar los productos comprados del carrito
        cart.products = cart.products.filter(
            (productInfo) =>
                // Filtrar los productos del carrito para excluir aquellos que fueron comprados
                !productsToPurchase.some(
                    prod => prod.product._id === productInfo.product._id
                )
        )

        // Asignar el ID del ticket al carrito
        cart.ticket = saveTicket._id
        await CartService.updatedCart({ _id: cid }, cart)

        // Obtener el ticket de compra y los productos no comprados actualizados
        const ticket = await CartService.getPurchase(saveTicket._id)
        const productsNotPurchased = await CartService.getCart(cid)
        const existNotPurchased = productsNotPurchased.products.length !== 0 ? true : false

        // Enviar un correo electrónico al usuario con los detalles de la compra
        await sendEmailPurchase(userEmail, ticket)

        // Renderizar la página del ticket con los detalles de la compra y los productos no comprados
        return res.render('ticket', { ticket, productsNotPurchased, existNotPurchased })
    } else {
        // Si no se pudo comprar ningún producto, mostrar un mensaje de error
        return res.render('errors/errorPage', {
            error: 'No product has been purchased',
        })
    }
}

