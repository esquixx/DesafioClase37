import winston from 'winston'
import { ENVIRONMENT } from '../config/config.js'
import moment from 'moment'

// Opciones de niveles y colores personalizados para el registro
const customLevelsOptions = {
    levels: {
        debug: 0,
        http: 1,
        info: 2,
        warning: 3,
        error: 4,
        fatal: 5
    },
    colors: {
        debug: 'white',
        http: 'green',
        info: 'blue',
        warning: 'yellow',
        error: 'magenta',
        fatal: 'red'
    }
}

/* Crea un registro basado en el entorno
 * Si el entorno es 'PROD', registra errores en un archivo; de lo contrario, registra en la consola
 * @param {string} env - El entorno ('PROD' u otro)
 * @returns {Object} - Instancia del logger de Winston
*/
const createLogger = env => {
    if (env === 'PROD') {
        return winston.createLogger({
            levels: customLevelsOptions.levels,
            transports: [
                new winston.transports.Console({
                    level: 'info',
                    format: winston.format.combine(
                        winston.format.timestamp({
                            format: moment().format('DD/MM/YYYY HH:mm:ss'),
                        }),
                        winston.format.colorize({ colors: customLevelsOptions.colors }),
                        winston.format.simple()
                    ),
                }),
                new winston.transports.File({
                    filename: './logs/errors.log',
                    level: 'error',
                    format: winston.format.combine(
                        winston.format.timestamp({
                            format: moment().format('DD/MM/YYYY HH:mm:ss'),
                        }),
                        winston.format.simple()
                    ),
                }),
            ],
        })
    } else {
        return winston.createLogger({
            levels: customLevelsOptions.levels,
            transports: [
                new winston.transports.Console({
                    level: 'debug',
                    format: winston.format.combine(
                        winston.format.timestamp({
                            format: moment().format('DD/MM/YYYY HH:mm:ss'),
                        }),
                        winston.format.colorize({ colors: customLevelsOptions.colors }),
                        winston.format.simple()
                    ),
                }),
            ],
        })
    }
}

/* Instancia del logger para el entorno de desarrollo.
 * Registra mensajes con niveles 'fatal' y superiores en la consola
*/
export const devLogger = winston.createLogger({
    levels: customLevelsOptions.levels,
    transports: [
        new winston.transports.Console({
            level: 'fatal',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: moment().format('DD/MM/YYYY HH:mm:ss'),
                }),
                winston.format.colorize({ colors: customLevelsOptions.colors }),
                winston.format.simple()
            ),
        }),
    ]
})

// Instancia predeterminada del logger basada en el entorno
const logger = createLogger(ENVIRONMENT)

export default logger
