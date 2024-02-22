import mongoose from 'mongoose'

// Definición del nombre de la colección en la db
const ticketsCollection = 'ticket'

// Esquema para la colección de tickets
const ticketSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },   // Código único del ticket
    purchase_datetime: { type: Date, default: Date.now, required: true },   // Fecha y hora de la compra
    amount: { type: Number, required: true },   // Monto total de la compra
    purchaser: { type: String, required: true },    // Comprador del ticket
    products: {    // Productos comprados en el ticket
        type: [
            {
                _id: false,  // No se guarda el _id en los subdocumentos
                product: {  // Producto comprado
                    type: mongoose.Schema.Types.ObjectId,   // Referencia al modelo de productos
                    ref: 'products',    // Colección de productos
                },
                quantity: Number,   // Cantidad del producto comprado
            },
        ],
        default: [],     // Valor por defecto: array vacío
    },
})

// Población de los subdocumentos 'products.product' antes de realizar una búsqueda
ticketSchema.pre('findOne', function () {
    this.populate('products.product')
})

// Modelo para la colección de tickets
export const ticketModel = mongoose.model(ticketsCollection, ticketSchema)
