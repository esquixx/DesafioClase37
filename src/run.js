import appRouter from './routes/router.js'
import ProductsRouter from './routes/products.router.js'
import CartsRouter from './routes/carts.router.js'
import ViewsProductsRouter from './routes/views.router.js'
import JWTRouter from './routes/jwt.router.js'
import MockingProductsRouter from './routes/mockingproducts.router.js'
import LoggerTestRouter from './routes/loggerTest.router.js'
import messageModel from './models/messages.model.js'
import errorMiddleware from './middlewares/error.middleware.js'
import { passportCall } from './utils/utils.js'
import UsersRouter from './routes/users.router.js'

/* Configura las rutas y funcionalidades principales de la aplicación.
 * @param {object} io - Instancia de socket.io para manejar eventos en tiempo real
 * @param {object} app - Instancia de Express para configurar las rutas
*/
const run = (io, app) => {
    // Middleware para adjuntar la instancia de socket.io a cada solicitud
    app.use((req, res, next) => {
        req.io = io
        next()
    })

    // Rutas para la gestión de productos
    const productsRouter = new ProductsRouter()
    app.use('/api/products', productsRouter.getRouter())

    // Rutas para la gestión de carritos de compra
    const cartsRouter = new CartsRouter()
    app.use('/api/carts', passportCall('jwt'), cartsRouter.getRouter())
    
    // Rutas relacionadas con la autenticación y gestión de usuarios
    const jwtrouter = new JWTRouter()
    app.use('/api/jwt', jwtrouter.getRouter())

    const usersRouter = new UsersRouter()
    app.use('/api/users', passportCall('jwt'), usersRouter.getRouter())

    // Rutas para las vistas de productos y gestión de carritos de compra
    const viewsProductsRouter = new ViewsProductsRouter()
    app.use('/products', passportCall('jwt'), viewsProductsRouter.getRouter())

    // Mocking de productos y manejo de errores
    const mockingProducts = new MockingProductsRouter()
    app.use('/mockingproducts', mockingProducts.getRouter())
    app.use(errorMiddleware)

    // Implementación de logger
    const loggerTestRouter = new LoggerTestRouter()
    app.use('/loggerTest', loggerTestRouter.getRouter())

    // Manejo de eventos de conexión en socket.io
    io.on('connection', async (socket) => {
        // Manejo de eventos relacionados con la actualización de productos y carritos
        socket.on('productList', (data) => {
            io.emit('updatedProducts', data)
        })
        socket.on('cartList', (data) => {
            io.emit('updatedCarts', data)
        })

        // Envío de alerta a todos los clientes conectados
        socket.broadcast.emit('alerta')

        // Envío de registros de mensajes a los clientes conectados
        let messages = (await messageModel.find()) ? await messageModel.find() : []
        socket.emit('logs', messages)

        // Manejo de eventos de mensajes de chat
        socket.on('message', (data) => {
            messages.push(data)
            messageModel.create(messages)
            io.emit('logs', messages)
        })
    })

    // Ruta principal de la aplicación
    class router extends appRouter {
        init() {
            this.get('/', ['PUBLIC'], (req, res) => {
                // Renderiza la página de inicio con un mensaje de bienvenida
                res.render('index', { name: 'Coderhouse' })
            })
        }
    }
    const indexRouter = new router()
    app.use('/', indexRouter.getRouter())
}

export default run
