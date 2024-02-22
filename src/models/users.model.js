import mongoose from 'mongoose'

// Definición del nombre de la colección en la db
const usersCollection = 'users'

// Definición del esquema del usuario
const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: false },
    password: { type: String, required: true },
    cart: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'carts' 
    },   // Carrito asociado
    role: { type: String, enum: ['user', 'premium', 'admin'], default: 'user' },
})   // Rol del usuario

// Modelo de usuario
export const userModel = mongoose.model(usersCollection, userSchema)
