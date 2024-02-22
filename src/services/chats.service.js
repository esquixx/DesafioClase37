import { Chat } from '../dao/factory/factory.js'
import ChatRepository from '../repositories/chat.repository.js'

export const ChatService = new ChatRepository(new Chat())
// Se instancia el servicio 'ChatService' utilizando el repositorio de chat, el cual se inicializa con una instancia de 'Chat' (una implementación específica del DAO para los datos del chat)
