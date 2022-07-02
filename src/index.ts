import client from './client.js'
// import { errorCatch } from './utils/utils.js'

client.login()

class X {
    constructor() {
        this.x = 1
    }

    x: number

    // @errorCatch(import.meta.url)
    getX() {
        return this.x
    }
}

new X().getX()
