// Clase que representa un repositorio para la gestión de mensajes en el chat en la db
export default class ChatRepository {
    constructor(dao) {
        // Inicializa el DAO asociado al repositorio
        this.dao = dao
    }

    // Método para obtener todos los mensajes del chat de la db
    getMessages = async () => await this.dao.getMessages()
}
