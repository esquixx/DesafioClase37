import express from 'express'
import exphbs from 'express-handlebars'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import { Server } from 'socket.io'
import run from './run.js'
import initializePassport from './config/passport.config.js'
import { __dirname, dateHelper, srcDir } from './utils/utils.js'
import {
    PORT,
    SECRET_PASS,
    MONGO_URI,
    MONGO_DB_NAME
} from './config/config.js'
import { devLogger } from './utils/logger.js'

// Inicialización de Express
const app = express()

// Middleware para procesar JSON y datos de formulario
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Middleware para servir archivos estáticos
app.use(express.static(__dirname + '/public'))

// Configuración de Handlebars
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: dateHelper
}))
app.set('views', __dirname + '/views')
app.set('view engine', '.hbs')

// Middleware para parsear cookies con la clave secreta
app.use(cookieParser(SECRET_PASS))

// Inicialización de Passport para autenticación
initializePassport()
app.use(passport.initialize())

// Configuración de Mongoose para conectarse a la db MongoDB
mongoose.set("strictQuery", false)

try {
    await mongoose.connect(`${MONGO_URI}${MONGO_DB_NAME}`)
    devLogger.info('Mongoose connected to MongoDB 😎')

    // Creación de servidor HTTP y configuración de Socket.IO
    const serverHttp = app.listen(PORT, () => devLogger.http(`Server listening on port http://localhost:${PORT} 🏃...`))
    const io = new Server(serverHttp)
    app.set("socketio", io)

    // Ejecución de la función de inicialización del servidor
    run(io, app)
} catch (error) {
    // Manejo de errores en caso de fallo en la conexión a la db
    devLogger.error(`Cannot connect to dataBase 😟: ${error}`)
    process.exit()
}
