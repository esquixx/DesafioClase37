// Importar el modelo de mensajes
import messageModel from '../models/messages.model.js'

// Clase que representa el acceso a datos para el chat
export default class ChatDAO {
    
    // Método para obtener todos los mensajes del chat
    getMessages = async () => await messageModel.find().lean().exec()
}