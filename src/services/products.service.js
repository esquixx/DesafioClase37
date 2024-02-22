import { Product } from '../dao/factory/factory.js'
import ProductRepository from '../repositories/product.repository.js'

// Instancia del servicio 'ProductService' utilizando el repositorio de productos, que se inicializa con una instancia de 'Product' (una implementación específica del DAO para los datos de productos)
export const ProductService = new ProductRepository(new Product())

// Función asíncrona 'getProductsService' para obtener una lista paginada de productos basada en los parámetros de la solicitud
export const getProductsService = async (req) => {
    // Parámetros de paginación, clasificación y filtrado obtenidos de la solicitud
    const limit = parseInt(req.query.limit) || 10
    const page = parseInt(req.query.page) || 1
    const sort = req.query.sort || ''
    const category = req.query.category || ''
    const availability = parseInt(req.query.stock) || ''

    // Objeto de filtro inicializado vacío
    let filter = {}

    // Se aplica el filtro por categoría si se proporciona en la solicitud
    if (req.query.category) {
        filter = { category }
    }

    // Se aplica el filtro por disponibilidad de stock si se proporciona en la solicitud
    if (req.query.stock) {
        filter = { ...filter, stock: availability }
    }

    // Opciones de clasificación inicializadas como un objeto vacío
    // let sortOptions = {}

    // Se configuran las opciones de clasificación según el parámetro 'sort' de la solicitud
    let sortOptions = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {}
    /* if (sort === 'asc') {
        sortOptions = { price: 1 }
    } else if (sort === 'desc') {
        sortOptions = { price: -1 }
    } */

    // Configuración de las opciones de paginación y lean para la consulta de productos
    const options = {
        limit,
        page,
        sort: sortOptions,
        lean: true,
    }

    // Obtención de la lista paginada de productos utilizando el método 'getAllPaginate' del servicio 'ProductService'
    const result = await ProductService.getAllPaginate(filter, options)

    // Extracción de metadatos de paginación del resultado
    const totalPages = result.totalPages
    const prevPage = result.prevPage
    const nextPage = result.nextPage
    const currentPage = result.page
    const hasPrevPage = result.hasPrevPage
    const hasNextPage = result.hasNextPage
    const prevLink = hasPrevPage ? `/api/products?page=${prevPage}` : null
    const nextLink = hasNextPage ? `/api/products?page=${nextPage}` : null

    // Retorno de los productos paginados y los metadatos de paginación
    return {
        payload: result.docs,
        limit: result.limit,
        totalPages,
        prevPage,
        nextPage,
        page: currentPage,
        hasPrevPage,
        hasNextPage,
        prevLink,
        nextLink,
    }
}
