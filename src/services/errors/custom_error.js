// Clase para crear errores personalizados
export default class CustomError {
    // Método estático para crear un error personalizado
    static createError({ name = 'Error', cause, message, code }) {
        
        // Se crea una nueva instancia de Error con el mensaje y la causa proporcionados
        const error = new Error(message, { cause })

        // Se establece el nombre y el código del error
        error.name = name
        error.code = code

        // Se lanza el error
        throw error
    }
}
