import passport from 'passport'
import local from 'passport-local'
import GithubStrategy from 'passport-github2'
import jwt from 'passport-jwt'
import bcrypt from 'bcrypt'
import { UserService } from '../services/users.service.js'
import { CartService } from '../services/carts.service.js'
import {
    isValidPassword,
    generateToken,
    createHash
} from '../utils/utils.js'
import {
    SIGNED_COOKIE_KEY,
    PRIVATE_KEY,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    JWT_CLIENT_ID,
    JWT_CLIENT_SECRET,
} from './config.js'
import UserEmailDTO from '../dto/userEmail.dto.js'
import { sendEmailRegister } from '../services/nodemailer/mailer.js'
import { devLogger } from '../utils/logger.js'

// Configuración de la estrategia local para la autenticación
const LocalStrategy = local.Strategy

// Configuración de la estrategia JWT para la autenticación basada en tokens
const JWTStrategy = jwt.Strategy

// Extracción del token JWT de las solicitudes entrantes
const ExtractJWT = jwt.ExtractJwt

// Extrae un token de las cookies firmadas de la solicitud.
export const cookieExtractor = (req) => {
    // Verifica si req existe y tiene cookies firmadas, de lo contrario, establece token en null
    let token = req && req.signedCookies ? req.signedCookies[SIGNED_COOKIE_KEY] : null

    // Retorna el token obtenido
    return token
}

const initializePassport = () => {

    // Configuración de passport para la estrategia 'register' utilizando LocalStrategy
    passport.use(
        'register',
        new LocalStrategy(
            {
                passReqToCallback: true,    // Permitir el paso de la solicitud al callback
                usernameField: 'email',     // Campo utilizado como nombre de usuario (en este caso, el correo electrónico)
            },
            async (req, username, password, done) => {
                // Extracción de datos del cuerpo de la solicitud
                const { first_name, last_name, email, age } = req.body

                try {
                    // Verificar si el usuario ya está registrado
                    const user = await UserService.findOne({ email: username })
                    if (user) {
                        return done(null, false)    // Usuario ya existe, no se puede registrar
                    }

                    // Crear un nuevo carrito para el usuario
                    const cartNewUser = await CartService.create({})

                    // Construir objeto de nuevo usuario
                    const newUser = {
                        first_name,
                        last_name,
                        email,
                        age,
                        password: createHash(password),     // Crear hash de la contraseña
                        cart: cartNewUser._id,      // Asignar el ID del nuevo carrito al usuario
                    }

                    // Verificar si el nuevo usuario es un administrador y actualizar su rol si es necesario
                    if (newUser.email === ADMIN_EMAIL && bcrypt.compareSync(ADMIN_PASSWORD, newUser.password)) {
                        newUser.role = 'admin'
                    }

                    // Crear el nuevo usuario en la base de datos
                    const result = await UserService.create(newUser)

                    // Retornar el nuevo usuario creado
                    return done(null, result)
                } catch (error) {
                    // Manejo de errores
                    devLogger.error(error)
                    return done('Error creating user: ' + error.message)
                }
            }
        )
    )

    // Configuración de passport para la estrategia 'login' utilizando LocalStrategy
    passport.use(
        'login',
        new LocalStrategy(
            {
                usernameField: 'email',     // Campo utilizado como nombre de usuario (en este caso, el correo electrónico)
            },
            async (username, password, done) => {
                try {
                    // Buscar el usuario en la db utilizando su correo electrónico
                    const user = await UserService.findOne({ email: username })

                    // Verificar si el usuario no existe o si la contraseña no es válida
                    if (!user || !isValidPassword(user, password)) {
                        return done(null, false)    // Credenciales inválidas, no se puede iniciar sesión
                    }

                    // Si las credenciales son válidas, retornar el usuario
                    return done(null, user)
                } catch (error) {
                    // Manejo de errores
                    devLogger.error(error)
                    return done('Error getting user')   // Error al obtener el usuario
                }
            }
        )
    )

    // Configuración de passport para la estrategia 'github' utilizando GithubStrategy
    passport.use(
        'github',
        new GithubStrategy(
            {
                clientID: JWT_CLIENT_ID,    // Identificación del cliente proporcionada por GitHub
                clientSecret: JWT_CLIENT_SECRET,    // Secreto del cliente proporcionado por GitHub
                callbackURL: 'http://localhost:8080/api/jwt/githubcallback',    // URL de retorno para el proceso de autenticación en GitHub
            },
            async (accessTocken, refreshToken, profile, done) => {
                try {
                    // Obtener el nombre de usuario y correo electrónico del perfil de GitHub
                    const userName = profile.displayName || profile.username
                    const userEmail = profile._json.email

                    // Buscar si el usuario ya está registrado en la db
                    const existingUser = await UserService.findOne({ email: userEmail })
                    // Si el usuario ya existe, generar un token y devolverlo junto con el usuario
                    if (existingUser) {
                        const token = generateToken(existingUser)
                        return done(null, existingUser, { token })
                    }

                    // Si el usuario no está registrado, crear un nuevo carrito para él
                    const cartNewUser = await CartService.create({})

                    // Construir objeto de nuevo usuario con los datos obtenidos de GitHub
                    const newUser = {
                        first_name: userName,
                        last_name: ' ',     // Puede ser necesario ajustar esto según los requisitos de la aplicación
                        email: userEmail,
                        password: ' ',      // La contraseña puede ser opcional si la autenticación se realiza a través de GitHub
                        cart: cartNewUser._id,
                    }

                    // Verificar si el nuevo usuario es un administrador y actualizar su rol si es necesario
                    if (newUser.email === ADMIN_EMAIL) {
                        newUser.role = 'admin'
                    }

                    // Crear el nuevo usuario en la db
                    const result = await UserService.create(newUser)
                    // console.log(result)

                    // Registrar el nuevo usuario en el sistema (enviar correo electrónico)
                    const userSendEmail = new UserEmailDTO(result)
                    await sendEmailRegister(userSendEmail)

                    // Generar un token para el nuevo usuario y devolverlo junto con el usuario
                    const token = generateToken(result)
                    return done(null, result, { token })
                } catch (error) {
                    // Manejo de errores
                    devLogger.error(error)
                    return done('Error getting user')
                }
            }
        )
    )

    // Configuración de passport para la estrategia 'jwt' utilizando JWTStrategy
    passport.use(
        'jwt',
        new JWTStrategy(
            {
                jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),   // Extracción del token JWT de la solicitud utilizando el extractor definido anteriormente
                secretOrKey: PRIVATE_KEY,   // Clave secreta utilizada para verificar la autenticidad del token JWT
            },
            async (jwt_payload, done) => {
                try {
                    // Devolver el payload del token JWT como usuario autenticado
                    return done(null, jwt_payload)
                } catch (error) {
                    // Manejo de errores
                    return done(error)
                }
            }
        )
    )

    // Configuración de passport para la estrategia 'current' utilizando JWTStrategy
    passport.use(
        'current',
        new JWTStrategy(
            {
                jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),   // Extracción del token JWT de la solicitud utilizando el extractor definido anteriormente
                secretOrKey: PRIVATE_KEY,   // Clave secreta utilizada para verificar la autenticidad del token JWT
            },
            async (jwt_payload, done) => {
                try {
                    // Verificar si el payload del token contiene información del usuario
                    const user = jwt_payload.user

                    // Si no hay información del usuario en el payload, devolver un error
                    if (!user) {
                        return done(null, false, { message: 'No token provided' })
                    }

                    // Buscar al usuario en la db utilizando su ID
                    const existingUser = await UserService.findById(user._id)

                    // Si no se encuentra al usuario en la db, devolver un error
                    if (!existingUser) {
                        return done(null, false, {
                            message: 'There is no user with an active session',
                        })
                    }

                    // Si el usuario existe y tiene una sesión activa, devolverlo como usuario autenticado
                    return done(null, existingUser)
                } catch (error) {
                    // Manejo de errores
                    devLogger.error(error)
                    return done(error)
                }
            }
        )
    )
}

// Configuración de passport para serializar al usuario
passport.serializeUser((user, done) => {
    // Almacenar el ID del usuario en la sesión
    done(null, user._id)
})

// Configuración de Passport para deserializar al usuario
passport.deserializeUser(async (id, done) => {
    try {
        // Buscar al usuario en la base de datos utilizando su ID almacenado en la sesión
        const user = await UserService.findById(id)
        // Devolver el usuario encontrado
        done(null, user)
    } catch (error) {
        // Manejo de errores
        devLogger.error(error)
        done(error)
    }
})

export default initializePassport
