import fs from 'fs'
import { __dirname } from '../../utils/utils.js'
import { devLogger } from '../../utils/logger.js'

class ProductManager {
    #path
    #format
    constructor(path) {
        this.#path = path
        this.#format = "utf-8"
        this.products = []
    }

    #validateProduct = async (product) => {
        const products = await this.getProducts()

        const existingProduct = await products.find(
            (prod) => prod.code === product.code
        )
        if (existingProduct !== undefined) {
            // console.log('A product with the same code already exists')
            devLogger.error('A product with the same code already exists')
            return false
        }

        return true
    }

    getProducts = async () => {
        try {
            return JSON.parse(
                await fs.promises.readFile(this.#path, this.#format)
            )
        } catch (error) {
            // console.log('error: file not found')
            devLogger.error('error: file not found')
            return []
        }
    }

    #generateId = async () => {
        const products = await this.getProducts()
        return products.length === 0 ? 1 : products[products.length - 1].id + 1
    }

    addProduct = async (title, description, price, thumbnail, code, category, stock) => {
        const products = await this.getProducts()

        const newProduct = {
            id: await this.#generateId(),
            title,
            description,
            price,
            thumbnail: thumbnail || [],
            code,
            category,
            stock,
            status: true,
        }

        if (await this.#validateProduct(newProduct)) {
            products.push(newProduct)

            await fs.promises.writeFile(
                this.#path,
                JSON.stringify(products, null, '\t')
            )

            this.products = products

            return newProduct
        }
    }

    getProductsById = async (id) => {
        const products = await this.getProducts()
        const product = products.find((prod) => prod.id == id)
        return product 
    }

    updateProduct = async (id, update) => {
        const products = await this.getProducts()

        const index = products.findIndex((prod) => prod.id == id)

        if (index !== -1) {
            const isValid = await this.#validateProduct(update)
            if (!isValid) {
                // return console.log('Error updating: invalid update')
                return devLogger.error('Error updating: invalid update')
            }

            products[index] = { ...products[index], ...update }

            await fs.promises.writeFile(
                this.#path,
                JSON.stringify(products, null, "\t"),
                this.#format
            )

            this.products = products

            // return console.log('Updated Product', products[index])
            return devLogger.info('Updated Product', products[index])
        }

        // return console.log('Error updating: product not found')
        return devLogger.error('Error updating: product not found')
    }

    deleteProduct = async (id) => {
        try {
            const products = await this.getProducts()
            const filterProducts = products.filter((prod) => prod.id != id)
            if (products.length !== filterProducts.length) {
                await fs.promises.writeFile(
                    this.#path,
                    JSON.stringify(filterProducts, null, '\t'),
                    this.#format
                )
                this.products = filterProducts
                return 'Product successfully removed'
            }
            return 'The product with that ID does not exist'
        } catch (err) {
            // console.log(err)
            devLogger.error(err)
        }
    }
}

export const productManager = new ProductManager(`${__dirname}/api/products.json`)
