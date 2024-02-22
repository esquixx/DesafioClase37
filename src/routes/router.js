import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { 
    PRIVATE_KEY, 
    SIGNED_COOKIE_KEY 
} from '../config/config.js'
import { cookieExtractor } from '../config/passport.config.js'
import { devLogger } from '../utils/logger.js'

// Clase base para definir rutas en la aplicación
export default class appRouter {
    constructor() {
        this.router = Router()  // Se inicializa el enrutador
        this.init()     // Se inicializan las rutas
    }

    // Método para obtener el enrutador
    getRouter() {
        return this.router
    }
    
    // Método abstracto para inicializar las rutas
    init() {} 

    // Método para manejar las peticiones GET
    get(path, policies, ...callbacks) {
        this.router.get(
            path,
            this.handlePolicies(policies),
            this.generateCustomResponses,
            this.applyCallbacks(callbacks)
        )
    }

    // Método para manejar las peticiones POST
    post(path, policies, ...callbacks) {
        this.router.post(
            path,
            this.handlePolicies(policies),
            this.generateCustomResponses,
            this.applyCallbacks(callbacks)
        )
    }

    // Método para manejar las peticiones PUT
    put(path, policies, ...callbacks) {
        this.router.put(
            path,
            this.handlePolicies(policies),
            this.generateCustomResponses,
            this.applyCallbacks(callbacks)
        )
    }

    // Método para manejar las peticiones DELETE
    delete(path, policies, ...callbacks) {
        this.router.delete(
            path,
            this.handlePolicies(policies),
            this.generateCustomResponses,
            this.applyCallbacks(callbacks)
        )
    }

    // Método para aplicar los callbacks a las rutas
    applyCallbacks(callbacks) {
        return callbacks.map((callback) => async (...params) => {
            try {
                await callback.apply(this, params)
            } catch (error) {
                // Se registra el error en el logger
                devLogger.error(error)
                // Se envía una respuesta de error al cliente
                params[1].status(500).json({ error })
            }
        })
    }

    // Middleware para generar respuestas personalizadas
    generateCustomResponses = (req, res, next) => {
        // Método para enviar una respuesta de éxito
        res.sendSuccess = (payload) => 
            res.json({ status: 'success', payload })

        // Método para enviar una respuesta de creación exitosa
        res.createdSuccess = (payload) => 
            res.status(201).json({ status: 'success', payload })
        
        // Método para enviar una respuesta de error interno del servidor
        res.sendServerError = (error) => 
            res.status(500).json({ status: 'error', error })
        
        // Método para enviar una respuesta de error del usuario
        res.sendUserError = (error) => 
            res.status(400).json({ status: 'error', error })

        // Método para enviar una respuesta de fallo de autenticación
        res.authFailError = (error) => 
            res.status(401).json({ status: 'error', error })
        
        // Método para enviar una respuesta de error de solicitud no encontrada
        res.sendRequestError = (error) => 
            res.status(404).json({ status: 'error', error })

        // Se pasa al siguiente middleware en la cadena de middleware
        next()
    }

    // Middleware para manejar las políticas de acceso
    handlePolicies = (policies) => (req, res, next) => {
        // Si la política permite acceso público, se permite la solicitud
        if (policies[0] === 'PUBLIC') return next()

        // Se obtienen las cabeceras de autenticación
        const authHeaders = req.signedCookies[SIGNED_COOKIE_KEY]

        // Si no hay cabeceras de autenticación, se devuelve un error de no autorizado
        if (!authHeaders) {
            return res.status(401).render('errors/errorPage', {
                status: 'error',
                error: 'Unauthorized',
            })
        }

        // Se extrae el token de autenticación
        const token = cookieExtractor(req)

        // Se verifica el token y se obtiene el usuario
        let user = jwt.verify(token, PRIVATE_KEY)

        // Si el usuario no tiene permisos adecuados, se devuelve un error de no autorizado
        if (!policies.includes(user.user.role.toUpperCase())) {
            return res.status(403).render('errors/errorPage', {
                status: 'error',
                error: 'No authorized',
            })
        }

        // Se adjunta el usuario a la solicitud
        req.user = user
        next()
    }
}
