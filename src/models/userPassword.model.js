import mongoose from 'mongoose'

// Definición para la colección de contraseñas de usuario
const usersPasswordCollection = 'usersPassword'


const userPasswordSchema = new mongoose.Schema({
    email: {
        type: String,
        ref: 'users'     // Referencia al modelo de usuarios
    },
    token: {
        type: String,
        required: true   // El token es obligatorio
    },
    createdAt: {
        type: Date,  // Fecha de creación por defecto
        default: Date.now,
        expiredAfterSeconds: 3600   // La contraseña expira después de 3600 segundos (1 hora)
    }
})

// Modelo para la colección de contraseñas de usuario
export const userPasswordModel = mongoose.model(usersPasswordCollection, userPasswordSchema)
