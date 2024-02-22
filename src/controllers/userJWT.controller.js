import {
    generateToken,
    createHash,
    isValidPassword
} from '../utils/utils.js'
import {
    SIGNED_COOKIE_KEY,
    PRIVATE_KEY
} from '../config/config.js'
import UserDTO from '../dto/users.dto.js'
import UserEmailDTO from '../dto/userEmail.dto.js'
import {
    sendEmailRegister,
    emailResetPassword
} from '../services/nodemailer/mailer.js'
import { UserService } from '../services/users.service.js'
import { UserPasswordService } from '../services/usersPass.service.js'
import jwt from 'jsonwebtoken'
import { linkToken } from '../utils/utils.js'
import { devLogger } from '../utils/logger.js'

// Controlador para el registro de usuario
export const userRegisterController = async (req, res) => {
    // Crear un objeto UserEmailDTO para enviar el correo electrónico de registro
    const userEmail = new UserEmailDTO(req.user)

    // Enviar correo electrónico de registro
    await sendEmailRegister(userEmail)

    // Redirigir al usuario a la página de inicio de sesión
    res.redirect('/api/jwt/login')
}

// Controlador de fallo de registro. 
export const failRegisterController = (req, res) => {
    // Renderiza una página de error cuando falla el registro
    res.render('errors/errorPage', {
        status: 'error',
        error: 'Failed Register!',
    })
}

// Controlador para ver la página de registro
export const viewRegisterController = (req, res) => {
    // Renderiza la página de registro
    res.render('sessions/register')
}

// Controlador de inicio de sesión de usuario
export const userLoginController = (req, res) => {
    // Extrae el usuario de la solicitud actual
    const user = req.user

    // Genera un token de acceso utilizando la información del usuario
    const access_token = generateToken(user)

    // Establecer la cookie firmada con el token de acceso
    res.cookie(SIGNED_COOKIE_KEY, access_token, { signed: true }).redirect('/products')
}

// Controlador para renderizar una página de error cuando las credenciales de inicio de sesión son inválidas
export const failLoginController = (req, res) => {
    res.render('errors/errorPage', { status: 'error', error: 'Invalid Credentials' })
}

// Controlador para renderizar la página de inicio de sesión
export const viewLoginController = (req, res) => {
    res.render('sessions/login')
}

// Controlador para iniciar sesión con GitHub (aún no implementado)
export const loginGithubController = async (req, res) => { }

// Controlador para manejar el callback de GitHub OAuth
export const githubCallbackController = async (req, res) => {
    // Extraer el token de acceso de la información de autenticación proporcionada por GitHub
    const access_token = req.authInfo.token

    // Establecer la cookie firmada con el token de acceso y redirigir a la página de productos
    res.cookie(SIGNED_COOKIE_KEY, access_token, { signed: true }).redirect('/products')
}

// Controlador para cerrar la sesión del usuario
export const userLogoutController = (req, res) => {
    // Limpiar la cookie firmada y redirigir a la página de inicio de sesión
    res.clearCookie(SIGNED_COOKIE_KEY).redirect('/api/jwt/login')
}

// Controlador para renderizar la página de error genérica
export const errorPageController = (req, res) => {
    res.render('errors/errorPage')
}

// Controlador para renderizar la página de error de restablecimiento de contraseña
export const errorResetPassController = (req, res) => {
    res.render('errors/errorResetPass')
}

// Controlador para obtener la información del usuario actualmente autenticado y renderizar su perfil
export const userCurrentController = (req, res) => {
    // Crear una instancia de UserDTO con la información del usuario autenticado
    const user = new UserDTO(req.user)

    // Determinar si el usuario es un usuario estándar o premium
    const isUser = user.role === 'user' ? true : false
    const isPremium = user.role === 'premium' ? true : false

    // Renderizar la página de perfil del usuario con la información correspondiente
    res.render('sessions/current', { user, isUser, isPremium })
}

// Controlador para renderizar la página de restablecimiento de contraseña por correo electrónico
export const passwordResetController = (req, res) => {
    res.render('sessions/passwordResetEmail')
}

// Controlador para manejar la solicitud de restablecimiento de contraseña por correo electrónico
export const passwordResetEmailController = async (req, res) => {
    try {
        // Extraer el correo electrónico del cuerpo de la solicitud
        const { email } = req.body

        // Buscar el usuario por correo electrónico en la db
        const userFound = await UserService.findOne({ email: email })

        // Verificar si el usuario no existe
        if (!userFound) {
            // Renderizar la página de error de restablecimiento de contraseña con un mensaje de error
            return res.render('errors/errorResetPass', { status: 'error', error: 'Invalid Email' })
        }

        // Crear una instancia de UserEmailDTO con la información del usuario encontrado
        const userEmail = new UserEmailDTO(userFound)

        // Generar un token de restablecimiento de contraseña
        const token = linkToken(userEmail)

        // Crear una entrada de restablecimiento de contraseña en la db
        await UserPasswordService.create({ email, token })

        // Enviar un correo electrónico de restablecimiento de contraseña al usuario
        await emailResetPassword(userEmail, token)

        // Renderizar la página de mensaje de correo electrónico con un mensaje de éxito
        res.render('sessions/messageEmail', { status: 'success', message: `Email successfully sent to ${email} for resetting the password` })
    } catch (error) {
        devLogger(error)
    }
}

// Controlador para manejar el cambio de contraseña
export const changePasswordController = async (req, res) => {
    // Extraer el ID del token de restablecimiento de contraseña de los parámetros de la solicitud
    const tid = req.params.tid

    // Buscar el token en la db
    const tokenId = await UserPasswordService.findOne({ token: tid })

    // Verificar si el token no existe o ha caducado
    if (!tokenId) {
        // Renderizar una página de error si el token no es válido o ha caducado
        return res.render('errors/errorResetPass', { status: 'error', error: 'Invalid token | The token has expired' })
    }

    // Renderizar la página para cambiar la contraseña, pasando el ID del token como contexto
    res.render('sessions/changePassword', { tid })
}

// Controlador para enviar una nueva contraseña después de un restablecimiento
export const sendNewPasswordController = async (req, res) => {
    try {
        // Obtener el ID del token de restablecimiento de contraseña de los parámetros de la solicitud
        const tid = req.params.tid

        // Verificar si el token es válido
        if (!tid) {
            // Renderizar una página de error si el token no es válido o ha caducado
            return res.render('errors/errorResetPass', { status: 'error', error: 'Invalid token | The token has expired' })
        }

        // Verificar el token y extraer el correo electrónico del usuario
        const userEmail = jwt.verify(tid, PRIVATE_KEY)

        // Obtener la nueva contraseña del cuerpo de la solicitud
        const { password } = req.body

        // Buscar al usuario por su correo electrónico
        const userFound = await UserService.findOne({
            email: userEmail.data.email,
        })

        // Verificar si el usuario existe y si la contraseña es válida
        if (!userFound || isValidPassword(userFound, password)) {
            // Renderizar una página de error si ocurre un error al actualizar la contraseña
            return res.render('errors/errorChangePass', { status: 'error', error: 'Error updating password', tid })
        }

        // Actualizar la contraseña del usuario
        const userUpdated = await UserService.update(userEmail.data._id, {
            password: createHash(password)
        })

        // Verificar si la actualización de la contraseña fue exitosa
        if (!userUpdated) {
            // Renderizar una página de error si ocurre un error al actualizar la contraseña
            return res.render('errors/errorChangePass', { status: 'error', error: 'Error updating password', tid })
        }

        // Renderizar una página de éxito si la contraseña se actualiza con éxito
        res.render('sessions/messageEmail', { status: 'success', message: `Password updated sucessfully` })
    } catch (error) {
        devLogger(error)
    }
}
