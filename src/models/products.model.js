import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

// Definición del nombre de la colección en la db
const productsCollection = 'products'

// Esquema para la colección de productos
const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    thumbnails: { type: [String], default: [] },
    code: { type: String, required: true, unique: true },   // Lista de URLs de las imágenes del producto
    category: { type: String, required: true },
    stock: { type: Number, required: true },
    status: { type: Boolean, default: true },   // Estado del producto (activo/inactivo
    owner: { type: String, default: 'admin'},   // Propietario del producto
})

// Plugin para paginación
productSchema.plugin(mongoosePaginate)

// Modelo para la colección de productos
export const productModel = mongoose.model(productsCollection, productSchema)
