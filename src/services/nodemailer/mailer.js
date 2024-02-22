import nodemailer from 'nodemailer'
import Mailgen from 'mailgen'
import {
    NODEMAILER_PASS,
    NODEMAILER_USER
} from '../../config/config.js'
import { devLogger } from '../../utils/logger.js'
import moment from 'moment'


/* Envía un correo electrónico de compra al usuario
 * @param {string} userEmail - El correo electrónico del usuario
 * @param {object} ticket - El ticket de compra
 * @returns {Promise<object>} - La información del correo electrónico enviado
*/
export const sendEmailPurchase = async (userEmail, ticket) => {
    // Configuración del servicio de correo
    let config = {
        service: 'gmail',
        auth: {
            user: NODEMAILER_USER,
            pass: NODEMAILER_PASS,
        },
    }

    // Crear un transportador de nodemailer
    let transporter = nodemailer.createTransport(config)

    // Crear un generador de correo electrónico con Mailgen
    let Mailgenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Ecommerce',
            link: 'http://localhost:8080',
        },
    })

    // Obtener los datos de los productos del ticket
    let productsData = ticket.products.map(prod => ({
        item: prod.product.title,
        quantity: prod.quantity,
        price: `$${prod.product.price}`,
    }))

    // Configurar el contenido del correo electrónico
    let content = {
        body: {
            name: ticket.purchaser,
            intro: 'Your order has been processed successfully',
            dictionary: {
                date: moment(ticket.purchase_datetime).format('DD/MM/YYYY HH:mm:ss'),
            },
            table: {
                data: productsData,
                columns: {
                    // Opcionalmente, personalizar los anchos de las columnas
                    customWidth: {
                        item: '70%',
                        price: '30%',
                    },
                    // Opcionalmente, cambiar la alineación del texto de la columna
                    customAlignment: {
                        item: 'left',
                        price: 'right',
                    },
                },
            },
            outro: `Total: $${ticket.amount}`,
            signature: false,
        },
    }

    // Generar el correo electrónico con Mailgen
    let mail = Mailgenerator.generate(content)

    // Configurar el mensaje del correo electrónico
    let message = {
        from: NODEMAILER_USER,
        to: userEmail,
        subject: 'Thanks for your purchase',
        html: mail,
    }

    try {
        // Enviar el correo electrónico
        const email = await transporter.sendMail(message)
        return email
    } catch (error) {
        // Manejo de errores
        devLogger.error(error)
        throw error
    }
}

/* Envía un correo electrónico de registro al usuario
 * @param {object} userEmail - La información del usuario registrado
 * @returns {Promise<object>} - La información del correo electrónico enviado
*/
export const sendEmailRegister = async (userEmail) => {
    // Configuración del servicio de correo
    let config = {
        service: 'gmail',
        auth: {
            user: NODEMAILER_USER,
            pass: NODEMAILER_PASS,
        },
    }

    // Crear un transportador de nodemailer
    let transporter = nodemailer.createTransport(config)

    // Crear un generador de correo electrónico con Mailgen
    let Mailgenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Ecommerce',
            link: 'http://localhost:8080',
        },
    })

    // Configurar el contenido del correo electrónico
    let content = {
        body: {
            name: userEmail.full_name,
            intro: `Welcome! Your registration has been successfully completed for ${userEmail.email}`,
            outro: `Now you can explore the application to view our products and proceed with purchase as a ${userEmail.role}`,
            signature: false,
        }
    }

    // Generar el correo electrónico con Mailgen
    let mail = Mailgenerator.generate(content)

    // Configurar el mensaje del correo electrónico
    let message = {
        from: NODEMAILER_USER,
        to: userEmail.email,
        subject: 'Thanks for signing up',
        html: mail,
    }

    try {
        // Enviar el correo electrónico
        const email = await transporter.sendMail(message)
        return email
    } catch (error) {
        // Manejo de errores
        devLogger.error(error)
        throw error
    }
}

/* Envía un correo electrónico para restablecer la contraseña
 * @param {object} userEmail - La información del usuario para quien se restablecerá la contraseña
 * @param {string} tokenLink - El enlace único para restablecer la contraseña
 * @returns {Promise<object>} - La información del correo electrónico enviado
*/
export const emailResetPassword = async (userEmail, tokenLink) => {
    // Configuración del servicio de correo
    let config = {
        service: 'gmail',
        auth: {
            user: NODEMAILER_USER,
            pass: NODEMAILER_PASS,
        }
    }

    // Crear un transportador de nodemailer
    let transporter = nodemailer.createTransport(config)

    // Crear un generador de correo electrónico con Mailgen
    let Mailgenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Ecommerce',
            link: 'http://localhost:8080/',
        }
    })

    // Configurar el contenido del correo electrónico
    let content = {
        body: {
            name: `${userEmail.full_name}`,
            intro: `You're receiving this email because a password reset request was submitted for your account`,
            action: {
                instructions: 'Please click the button below to reset your password:',
                button: {
                    color: '#dc4d2f',
                    text: 'Reset your password',
                    link: `http://localhost:8080/api/jwt/passwordReset/${tokenLink}`,
                },
            },
            outro: `If you didn't initiate a password reset request, you can disregard this email`,
            signature: false,
        }
    }

    // Generar el correo electrónico con Mailgen
    let mail = Mailgenerator.generate(content)

    // Configurar el mensaje del correo electrónico
    let message = {
        from: NODEMAILER_USER,
        to: userEmail.email,
        subject: 'Password reset notification',
        html: mail,
    }

    try {
        // Enviar el correo electrónico
        const email = await transporter.sendMail(message)
        return email
    } catch (error) {
        // Manejo de errores
        devLogger.error(error)
        throw error
    }
}
