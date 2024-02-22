import passport from 'passport'
import appRouter from './router.js'
import { passportCallCurrent } from '../utils/utils.js'
import {
    changePasswordController,
    errorPageController,
    errorResetPassController,
    failLoginController,
    failRegisterController,
    githubCallbackController,
    loginGithubController,
    passwordResetController,
    passwordResetEmailController,
    sendNewPasswordController,
    userCurrentController,
    userLoginController,
    userLogoutController,
    userRegisterController,
    viewLoginController,
    viewRegisterController,
} from '../controllers/userJWT.controller.js'

// Clase que define las rutas relacionadas con la autenticación y gestión de usuarios mediante JWT
export default class JWTRouter extends appRouter {
    // Método para inicializar las rutas y los controladores asociados
    init() {
        // Ruta para registrar un nuevo usuario
        this.post('/register', ['PUBLIC'], passport.authenticate('register', {
            session: false,
            failureRedirect: '/api/jwt/failRegister',
        }), userRegisterController)
        
        // Ruta para mostrar un mensaje de fallo al registrar
        this.get('/failRegister', ['PUBLIC'], failRegisterController)

        // Vista para registrar usuarios a través de un formulario
        this.get('/register', ['PUBLIC'], viewRegisterController)

        // Ruta para iniciar sesión (login) con JWT y generar un token JWT
        this.post('/login', ['PUBLIC'], passport.authenticate('login', {
            session: false,
            failureRedirect: '/api/jwt/failLogin',
        }), userLoginController)
        this.get('/failLogin', ['PUBLIC'], failLoginController)

        // Vista de login, para iniciar sesión
        this.get('/login', ['PUBLIC'], viewLoginController)

        // Rutas para la autenticación mediante github
        this.get('/github', ['PUBLIC'], passport.authenticate('github', { scope: ['user: email'] }), loginGithubController)
        this.get('/githubcallback', ['PUBLIC'], passport.authenticate('github', { session: false }), githubCallbackController)

        // Ruta para cerrar sesión y eliminar el token JWT
        this.get('/logout', ['PUBLIC'], userLogoutController)
        this.get('/error', ['PUBLIC'], errorPageController)
        this.get('/errorResetPass', ['PUBLIC'], errorResetPassController)

        // Vista del perfil del usuario
        this.get('/current', ['PUBLIC'], passportCallCurrent('current'), userCurrentController)

        // Rutas para el cambio de contraseña
        this.get('/passwordReset', ['PUBLIC'], passwordResetController)
        this.post('/passwordReset', ['PUBLIC'], passwordResetEmailController)
        this.get('/passwordReset/:tid', ['PUBLIC'], changePasswordController)
        this.post('/changePassword/:tid', ['PUBLIC'], sendNewPasswordController)
    }
}
