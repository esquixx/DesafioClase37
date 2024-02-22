// Clase UserEmailDTO que representa un objeto de transferencia de datos para correos electrónicos de usuarios
export default class UserEmailDTO {
    // Constructor de la clase que recibe un objeto de usuario y lo convierte en un DTO de correo electrónico
    constructor(user) {
        // Asignar el ID del usuario al DTO
        this._id = user._id

        // Combinar el nombre y apellido del usuario y asignarlo al DTO como full_name
        this.full_name = `${user.first_name} ${user.last_name}`

        // Asignar el correo electrónico del usuario al DTO
        this.email = user.email

        // Asignar el rol del usuario al DTO
        this.role = user.role
    }
}
