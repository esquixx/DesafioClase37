import mongoose from 'mongoose'

// Definición del nombre de la colección en la db
const messagesCollection = 'messages'

// Esquema para la colección de mensajes
const messageSchema = mongoose.Schema({
    user: { type: String, required: true },  // Usuario que envió el mensaje
    message: { type: String, required: true },  // Contenido del mensaje
})

// Modelo para la colección de mensajes
const messageModel = mongoose.model(messagesCollection, messageSchema)

export default messageModel
