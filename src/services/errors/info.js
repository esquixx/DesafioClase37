// Genera información de error para productos
export const generateProductErrorInfo = product => {
    // Producto con propiedades incompletas o inválidas e información detallada del error
    return `
        One or more parameters are incomplete or invalid.
        List of required properties:
            - title: Should be a string. (${product.title})
            - price: Should be a number. (${product.price})
    `
}

// Genera información de error al agregar un producto al carrito
export const generateProductAddCartErrorInfo = (product) => {
    // Producto no encontrado e información detallada del error
    return `Product with ID ${product._id} not found `
}

// Genera información de error para el carrito
export const generateCartErrorInfo = (cart) => {
    // Carrito no encontrado e información detallada del error
    return `Cart with ID ${cart._id} doesn't exist`
}
