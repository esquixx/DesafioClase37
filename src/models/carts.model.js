import mongoose from 'mongoose'

// Definición del nombre de la colección en la db
const cartsCollection = 'carts'

// Definición del esquema para los carritos
const cartSchema = new mongoose.Schema({
    // Campo para almacenar los productos en el carrito
    products: {
        type: [
            {
                // Deshabilita la generación automática del campo _id para los productos
                _id: false,

                // Referencia al ID del producto en la colección de productos
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'products',    // Referencia al modelo de productos
                },
                quantity: Number,   // Cantidad del producto en el carrito
            },
        ],
        default: [],    // Valor por defecto: una lista vacía
    },
})

// Middleware para ejecutar una operación de población ('populate') antes de ejecutar la consulta 'findOne'
cartSchema.pre('findOne', function () {
    this.populate('products.product')       // Poblar el campo 'product' dentro del campo 'products'
})

// Creación del modelo de carrito utilizando el esquema definido
export const cartModel = mongoose.model(cartsCollection, cartSchema)
