import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import multer from 'multer'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import handlebars from 'handlebars'
import shortid from 'shortid'
import moment from 'moment'
import { PRIVATE_KEY } from '../config/config.js'

// Obtiene la ruta del directorio actual del archivo
const __filename = fileURLToPath(import.meta.url)
export const srcDir = dirname(__filename)
export const __dirname = join(srcDir, '..')

// Configura multer para el almacenamiento de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${__dirname}/public/img`)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
})

// Crea un middleware multer con la configuración de almacenamiento
export const uploader = multer({ storage })

// Función para crear un hash de contraseña
export const createHash = (password) =>
    bcrypt.hashSync(password, bcrypt.genSaltSync(10))

// Función para verificar si una contraseña es válida
export const isValidPassword = (user, password) =>
    bcrypt.compareSync(password, user.password)

// Función para generar un token JWT
export const generateToken = (user) => {
    const token = jwt.sign({ user }, PRIVATE_KEY, { expiresIn: '24h' })
    return token
}

// Función para generar un token JWT con un enlace
export const linkToken = data => {
    const token = jwt.sign({ data }, PRIVATE_KEY, { expiresIn: '1h' })
    return token
}

// Middleware para llamar a la estrategia de autenticación de Passport
export const passportCall = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(
            strategy,
            { session: false },
            function (err, user, info) {
                if (err) return next(err)
                if (info && info.name === 'TokenExpiredError') {
                    return res.status(401).render('errors/errorPage', {
                        status: 'error',
                        error: 'Token expired',
                    })
                }
                req.user = user
                next()
            }
        )(req, res, next)
    }
}

// Middleware para llamar a la estrategia de autenticación de Passport para el usuario actual
export const passportCallCurrent = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(
            strategy,
            { session: false },
            function (err, user, info) {
                if (err) return next(err)
                if (!user) {
                    if (info && info.message === 'No token has been provided') {
                        return res.status(401).json({ status: 'error', error: 'No token has been provided' })
                    } else if (info && info.message === 'There is no user currently in an active session') {
                        return res.status(401).json({ status: 'error', error: 'There is no user currently in an active session' })
                    } else {
                        return res.status(401).json({ status: 'error', error:  'Unauthorized access' })
                    }
                }
                req.user = user
                next()
            }
        )(req, res, next)
    }
}

// Función para generar un código único
export const generateUniqueCode = () => {
    return shortid.generate()
}

// Función de ayuda para formatear fechas con Handlebars
export const dateHelper = handlebars.registerHelper(
    'formatDate',
    function (date) {
        return moment(date).format('DD/MM/YYYY HH:mm:ss')
    }
)
